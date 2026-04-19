import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as http from 'http';
import { Server } from 'socket.io';
import winston from 'winston';
import { CONSTANTS } from '@venuexp/shared';
import { requireAuth } from './middleware/auth';
import { initGateWaitService } from './services/gateWait';
import { initConcessionWaitService } from './services/concessionWait';
import { createGateRoutes } from './routes/gates';
import { createConcessionRoutes } from './routes/concessions';
import { createRoutingRoutes } from './routes/routing';
import { initCrowdStateService } from './services/crowdStateService';
import './lib/firebase'; // Ensure Firebase is initialized

// ── Logger ────────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});

// ── Security Middleware ──────────────────────────────────────────────
const app = express();

// Rate limiting: 100 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use(limiter);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Needed for some dashboard analytics
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.firebaseio.com", "wss://*.firebaseio.com"],
    },
  },
}));
app.use(express.json());

// ── HTTP + WebSocket ──────────────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// ── Services (start broadcasting) ─────────────────────────────────────
const { getGates } = initGateWaitService(io);
const { getConcessions } = initConcessionWaitService(io);
const { handleConnection: handleCrowdConnection } = initCrowdStateService(io);

app.get('/', (_req, res) => {
  res.json({
    name: "VenueXP API",
    status: "live",
    version: "1.0.0",
    project: "Smart Sporting Venue Experience Platform",
    endpoints: [
      "/health",
      "/api/gates",
      "/api/concessions",
      "/api/crowd",
      "/socket.io"
    ]
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ── Protected routes (require valid Firebase token) ───────────────────
app.use('/api/gates', requireAuth, createGateRoutes(getGates));
app.use('/api/concessions', requireAuth, createConcessionRoutes(getConcessions));
app.use('/api/routing', requireAuth, createRoutingRoutes());

// ── WebSocket connections ─────────────────────────────────────────────
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Send current snapshot on connect so client doesn't wait for next tick
  socket.emit('gateUpdate', getGates());
  socket.emit('concessionUpdate', getConcessions());

  // Handle crowd zone room management
  handleCrowdConnection(socket);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// ── Start ─────────────────────────────────────────────────────────────
console.log("Booting API...");
const PORT = Number(process.env.PORT) || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log("Listening on", PORT);
  logger.info(`VenueXP API running on port ${PORT}`);
});
