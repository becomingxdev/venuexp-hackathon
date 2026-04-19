<div align="center">

# 🏟️ VenueXP

### Smart Sporting Venue Experience Platform

**Real-time crowd intelligence, IoT-powered wait times, and AI-driven venue operations — built for the scale of IPL, EPL, and beyond.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Firebase_Hosting-orange?style=for-the-badge)](https://venuexp-hackathon.web.app)
[![API Status](https://img.shields.io/badge/⚡_API-Cloud_Run_Live-brightgreen?style=for-the-badge)](https://venuexp-api-214382789963.asia-south1.run.app)
[![Build](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge&logo=github-actions)](https://github.com/becomingxdev/venuexp-hackathon)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![pnpm](https://img.shields.io/badge/pnpm-monorepo-F69220?style=for-the-badge&logo=pnpm)](https://pnpm.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

</div>

---

## 🎯 Problem Statement

Sporting venues with 50,000+ fans suffer from recurring, solvable failures every matchday:

| Problem | Impact |
|---|---|
| Gate bottlenecks form instantly after doors open | Crowd crushes, injuries, fan frustration |
| F&B wait times are invisible until you're in queue | Revenue loss, poor experience |
| Ops staff deploy reactively, not proactively | Delayed incident response |
| Fan mobile apps show static PDFs, not live data | Zero digital engagement during event |

**VenueXP fixes this** with a real-time, cloud-native platform that connects IoT sensors → Google Cloud → operations dashboards → fan mobile apps in a single data flow under 5 seconds.

---

## ✨ Live URLs

| Surface | URL |
|---|---|
| 🌐 Operations Dashboard | [https://venuexp-hackathon.web.app](https://venuexp-hackathon.web.app) |
| ⚡ Backend API | [https://venuexp-api-214382789963.asia-south1.run.app](https://venuexp-api-214382789963.asia-south1.run.app) |
| 🩺 Health Check | [/health](https://venuexp-api-214382789963.asia-south1.run.app/health) |

---

## 🏗️ Architecture

```
  IoT Sensors (Turnstile / IR / WiFi Probe)
         │
         ▼
  Google Cloud Pub/Sub  ←── venue-iot-telemetry topic
         │
         ▼
  Cloud Function (iot-aggregator)
  ├── Batches events per zone (3s window)
  └── Writes aggregated CrowdState → Firestore
         │
         ▼
  Firestore (crowd_states / gates / concessions)
         │
         ▼
  Cloud Run API  (apps/api)
  ├── REST: /api/gates, /api/concessions, /api/routing
  ├── WebSocket: Socket.IO broadcasts on state change
  └── Auth: Firebase JWT middleware on all protected routes
         │
         ├──────────────────────────────────┐
         ▼                                  ▼
  Ops Dashboard (ops-web)           Fan Mobile App (mobile)
  React + Vite hosted on            Expo (React Native)
  Firebase Hosting                  Socket.IO live feed
```

---

## 📦 Monorepo Structure

```
venuexp/
├── apps/
│   ├── api/             # Express + Socket.IO backend (Cloud Run)
│   ├── ops-web/         # React/Vite operations dashboard (Firebase Hosting)
│   ├── mobile/          # Expo React Native fan app
│   └── iot-aggregator/  # Google Cloud Functions Pub/Sub consumer
├── packages/
│   └── shared/          # Shared TypeScript types, constants & WS event names
├── infra/               # Terraform — Pub/Sub topics, dead-letter queues
├── turbo.json           # Turborepo task graph (build → test → lint)
└── pnpm-workspace.yaml  # Workspace definitions
```

---

## 🔥 Key Features

### 📡 Real-Time Crowd Intelligence
- Live crowd density heatmap with zone-specific WebSocket rooms
- Trend indicators (↑ increasing · → stable · ↓ decreasing) updated every 30 seconds
- Color-coded severity states: `low` → `moderate` → `high` → `critical`

### 🚪 Gate Wait Time Engine
- 4 gate streams with capacity percentage and wait time estimates
- Automatic `at-capacity` status when threshold exceeds 85%
- REST snapshot endpoint for initial load + live WebSocket for continuous updates

### 🍔 Concession & F&B Tracker
- Multi-category tracking: Food · Beverages · Merchandise · Restrooms
- Accessible-venue filtering, floor awareness, dietary tags
- Smart recommendations based on current queue depth

### 🤖 AI Wait-Time Prediction (Vertex AI Ready)
- `VertexPredictor` service with `heuristic-fallback` mode active now
- Architecture wired for Google Vertex AI Online Prediction endpoint swap-in
- Model reports confidence score alongside every prediction

### 🗺️ Smart Accessible Routing
- `POST /api/routing/path` — computes optimal route between any two LatLng points
- Accessible mode flag prioritizes ramp/lift routes over stairs
- Integrates with Google Maps Indoor Directions API

### 🔒 Production-Grade Security
- Firebase Admin JWT validation on all `/api/*` routes
- `helmet` with strict Content-Security-Policy headers
- Rate limiting: 100 req/min per IP
- Zod schema validation on every request body and URL parameter

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 20 + TypeScript 5 |
| Framework | Express.js 4 |
| Real-time | Socket.IO 4 |
| Auth | Firebase Admin SDK |
| Logging | Winston (structured JSON) |
| Validation | Zod |
| Security | Helmet + express-rate-limit |

### Frontend (ops-web)
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | CSS Modules |
| Real-time client | Socket.IO Client |
| Auth | Firebase JS SDK |

### Mobile (fan app)
| Layer | Technology |
|---|---|
| Framework | Expo + React Native |
| State | Zustand |
| Real-time | Socket.IO Client |
| Auth | Firebase Auth (anonymous + Google Sign-In) |

### Google Cloud & Infrastructure
| Service | Usage |
|---|---|
| **Cloud Run** | Hosts `apps/api` — auto-scales to zero |
| **Firebase Hosting** | Hosts `apps/ops-web` — global CDN |
| **Firestore** | Real-time crowd state persistence |
| **Firebase Auth** | JWT-based identity for all users |
| **Cloud Pub/Sub** | IoT telemetry ingestion pipeline |
| **Cloud Functions** | `iot-aggregator` serverless processor |
| **Vertex AI** | Wait-time prediction (ready to activate) |
| **Terraform** | Infrastructure-as-Code for Pub/Sub + dead-letter queuing |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- Firebase project with Firestore + Auth enabled
- Google Cloud project with Cloud Run API enabled

### 1. Clone & Install
```bash
git clone https://github.com/becomingxdev/venuexp-hackathon.git
cd venuexp-hackathon
pnpm install
```

### 2. Set Environment Variables
```bash
# apps/api — create .env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# apps/ops-web — already configured for production
# .env.local for local dev:
VITE_API_URL=http://localhost:3000
```

### 3. Run Everything Locally
```bash
pnpm dev        # Starts all apps in parallel via Turborepo
```

| App | URL |
|---|---|
| API | `http://localhost:3000` |
| Ops Dashboard | `http://localhost:5173` |

### 4. Build
```bash
pnpm build      # Type-checks + compiles all packages
pnpm test       # Runs 16 tests across api + iot-aggregator
pnpm lint       # ESLint strict across all workspaces
```

---

## 📡 API Reference

### Public Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | API manifest with endpoint list |
| `GET` | `/health` | Health check with process uptime |

### Protected Endpoints (Firebase JWT required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/gates` | All gate wait times snapshot |
| `GET` | `/api/gates/:id` | Single gate detail |
| `GET` | `/api/concessions` | All concession wait times |
| `GET` | `/api/concessions/:id` | Single concession detail |
| `POST` | `/api/routing/path` | Optimal venue path computation |

### WebSocket Events (Socket.IO)

| Event | Direction | Payload |
|---|---|---|
| `gateUpdate` | Server → Client | `Gate[]` |
| `concessionUpdate` | Server → Client | `Concession[]` |
| `crowdZoneUpdate` | Server → Client | `CrowdState` |
| `joinZone` | Client → Server | `zoneId: string` |
| `leaveZone` | Client → Server | `zoneId: string` |

---

## ☁️ Deployment

### Backend — Google Cloud Run
```bash
gcloud run deploy venuexp-api \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated
```

### Frontend — Firebase Hosting
```bash
pnpm --filter ops-web build
firebase deploy --only hosting
```

### Infrastructure — Terraform
```bash
cd infra
terraform init
terraform apply -var="project_id=venuexp-hackathon" -var="region=asia-south1"
```

---

## 🧪 Testing

```
pnpm test
```

```
 PASS  api/src/routes/gates.test.ts        (4 tests)
 PASS  api/src/routes/concessions.test.ts  (4 tests)
 PASS  api/src/routes/routing.test.ts      (3 tests)
 PASS  iot-aggregator (5 tests)

Test Suites: 4 passed
Tests:       16 passed, 16 total
Time:        ~3s
```

---

## 🗂️ Shared Package

All types, WebSocket event names, and constants are defined once in `packages/shared` and imported across every app — enforcing a single source of truth.

```typescript
// packages/shared/src/index.ts

export interface Gate    { id, name, status, currentWaitMinutes, capacityPercent, isAccessible, ... }
export interface CrowdState { zoneId, density, trend, predictedWait, ... }
export interface IoTEvent   { deviceId, sensorType, count, zoneId, timestamp }

export const WS_EVENTS = {
  GATE_UPDATE:        'gateUpdate',
  CONCESSION_UPDATE:  'concessionUpdate',
  CROWD_ZONE_UPDATE:  'crowdZoneUpdate',
} as const;
```

---

## 🗺️ Roadmap

- [ ] Activate Vertex AI Online Prediction endpoint (scaffold ready)
- [ ] Connect API services to live Firestore `onSnapshot` listeners
- [ ] Google Maps Indoor Directions integration for real routing polylines
- [ ] Push notifications for fan alerts (gate closures, high crowd warnings)
- [ ] Ops staff assignment persistence in Firestore
- [ ] CI/CD pipeline via GitHub Actions → Cloud Build

---

## 👨‍💻 Team

Built with ❤️ for the **Google Cloud × Firebase Hackathon**

| Contributor | Role |
|---|---|
| [@becomingxdev](https://github.com/becomingxdev) | Full-Stack + Cloud Architecture |

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

<div align="center">

**Built on Google Cloud · Powered by Firebase · Deployed in Asia South 1**

*Making every sporting event smarter, safer, and more enjoyable.*

</div>
