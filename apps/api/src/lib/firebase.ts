/**
 * Firebase Admin SDK initialisation.
 *
 * In production the service-account key is fetched from
 * Google Secret Manager via Workload Identity — never checked into source.
 * Locally, GOOGLE_APPLICATION_CREDENTIALS env-var points at a json key file.
 */
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export const firebaseAuth = admin.auth();
export const firestore = admin.firestore();
export default admin;
