import * as ff from '@google-cloud/functions-framework';
import * as admin from 'firebase-admin';
import { Aggregator } from './aggregator';
import { IoTEvent } from '@venuexp/shared';

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const aggregator = new Aggregator();

// Batch flusher (simulated for local testing/deployment)
let flushTimer: NodeJS.Timeout | null = null;
const FLUSH_INTERVAL_MS = 3000;

async function flushBatch() {
  const aggregatedStates = aggregator.flush();
  if (aggregatedStates.length === 0) return;

  const batch = db.batch();
  
  for (const state of aggregatedStates) {
    const docRef = db.collection('crowd_states').doc(state.zoneId);
    batch.set(docRef, state, { merge: true });
  }

  await batch.commit();
  console.log(`Flushed ${aggregatedStates.length} zone updates to Firestore`);
}

/**
 * Cloud Function entry point for Pub/Sub events.
 */
ff.cloudEvent('aggregateCrowdData', async (cloudEvent: ff.CloudEvent<any>) => {
  // Parse Pub/Sub message
  const messageData = cloudEvent.data as any;
  const payloadBase64 = messageData?.message?.data;
  
  if (!payloadBase64) {
    console.error('No payload found in cloud event');
    return;
  }

  try {
    const jsonString = Buffer.from(payloadBase64, 'base64').toString();
    const event = JSON.parse(jsonString) as IoTEvent;

    // Buffer the event
    aggregator.addEvent(event);

    // Reset/start flush timer
    if (!flushTimer) {
      flushTimer = setTimeout(async () => {
        await flushBatch();
        flushTimer = null;
      }, FLUSH_INTERVAL_MS);
    }
  } catch (err) {
    console.error('Failed to process IoT event', err);
  }
});
