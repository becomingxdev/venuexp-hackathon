/**
 * Accessibility preferences store.
 *
 * Persisted locally; drives routing-profile switches
 * and UI adjustments (large text, reduced motion).
 */
import { create } from 'zustand';
import type { AccessibilityProfile } from '@venuexp/shared';

interface AccessibilityState extends AccessibilityProfile {
  toggleAccessibleRouting: () => void;
  toggleAvoidStairs: () => void;
  toggleLargeText: () => void;
  toggleReduceMotion: () => void;
  setProfile: (profile: Partial<AccessibilityProfile>) => void;
}

export const useAccessibilityStore = create<AccessibilityState>((set) => ({
  accessibleRouting: false,
  avoidStairs: false,
  largeText: false,
  reduceMotion: false,

  toggleAccessibleRouting: () =>
    set((s) => ({
      accessibleRouting: !s.accessibleRouting,
      // When accessible routing is turned on, default avoid-stairs to true
      avoidStairs: !s.accessibleRouting ? true : s.avoidStairs,
    })),

  toggleAvoidStairs: () => set((s) => ({ avoidStairs: !s.avoidStairs })),
  toggleLargeText: () => set((s) => ({ largeText: !s.largeText })),
  toggleReduceMotion: () => set((s) => ({ reduceMotion: !s.reduceMotion })),

  setProfile: (profile) => set((s) => ({ ...s, ...profile })),
}));
