/**
 * Firebase JS SDK initialisation for the Expo mobile app.
 *
 * Config values are placeholders — swap with real project
 * credentials from Firebase Console → Project Settings → Your Apps.
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY            || 'PLACEHOLDER_API_KEY',
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN        || 'venuexp.firebaseapp.com',
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID         || 'venuexp',
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET     || 'venuexp.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER   || '000000000000',
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID             || '1:000000000000:web:placeholder',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export default app;
