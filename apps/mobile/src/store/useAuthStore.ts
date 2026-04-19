/**
 * Auth state — Zustand store backed by Firebase onAuthStateChanged.
 *
 * Supports Google Sign-In, anonymous sessions, and sign-out.
 * The token is read from the Firebase user and sent as
 * `Authorization: Bearer <token>` on all API calls.
 */
import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInAnonymously,
  signOut as fbSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import type { AuthUser } from '@venuexp/shared';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  /** Subscribe to Firebase auth changes — call once at app mount */
  listen: () => () => void;
  /** Anonymous sign-in (guest fans) */
  signInAnon: () => Promise<void>;
  /** Sign out */
  signOut: () => Promise<void>;
}

function mapFirebaseUser(fbUser: FirebaseUser): AuthUser {
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: fbUser.displayName,
    role: 'fan',                             // default; server may override via custom claims
    isAnonymous: fbUser.isAnonymous,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,
  error: null,

  listen: () => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const token = await fbUser.getIdToken();
        set({ user: mapFirebaseUser(fbUser), token, loading: false, error: null });
      } else {
        set({ user: null, token: null, loading: false });
      }
    });
    return unsubscribe;
  },

  signInAnon: async () => {
    try {
      set({ loading: true, error: null });
      await signInAnonymously(auth);
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  signOut: async () => {
    try {
      await fbSignOut(auth);
      set({ user: null, token: null });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));
