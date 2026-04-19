/**
 * VenueMap — Google Maps with indoor-level support.
 *
 * • Shows gate markers (color-coded by capacity).
 * • Shows concession markers.
 * • Respects accessibility mode to filter markers to accessible-only facilities.
 * • indoorLevelPicker enabled for multi-floor navigation.
 */
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { Gate, Concession } from '@venuexp/shared';
import { useAccessibilityStore } from '../store/useAccessibilityStore';

interface Props {
  gates: Gate[];
  concessions: Concession[];
  onGatePress?: (gate: Gate) => void;
  onConcessionPress?: (concession: Concession) => void;
}

const VENUE_CENTER = { latitude: 19.0763, longitude: 72.8778 };
const VENUE_DELTA  = { latitudeDelta: 0.004, longitudeDelta: 0.004 };

function gateMarkerColor(pct: number): string {
  if (pct >= 85) return 'red';
  if (pct >= 60) return 'orange';
  return 'green';
}

function concessionMarkerColor(minutes: number): string {
  if (minutes >= 15) return 'tomato';
  if (minutes >= 8) return 'gold';
  return 'aqua';
}

export default function VenueMap({ gates, concessions, onGatePress, onConcessionPress }: Props) {
  const { accessibleRouting } = useAccessibilityStore();

  // Filter to accessible-only when in accessible routing mode
  const visibleGates = accessibleRouting ? gates.filter((g) => g.isAccessible) : gates;
  const visibleConcessions = accessibleRouting
    ? concessions.filter((c) => c.isAccessible)
    : concessions;

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{ ...VENUE_CENTER, ...VENUE_DELTA }}
        showsIndoorLevelPicker={true}
        showsMyLocationButton={true}
        showsCompass={true}
        accessibilityLabel="Venue map showing gates and concessions"
      >
        {/* Gate markers */}
        {visibleGates.map((gate) => (
          <Marker
            key={gate.id}
            coordinate={{ latitude: gate.location.lat, longitude: gate.location.lng }}
            title={gate.name}
            description={`Wait: ${gate.currentWaitMinutes} min · ${gate.capacityPercent}% full`}
            pinColor={gateMarkerColor(gate.capacityPercent)}
            onPress={() => onGatePress?.(gate)}
          />
        ))}

        {/* Concession markers */}
        {visibleConcessions.map((c) => (
          <Marker
            key={c.id}
            coordinate={{ latitude: c.location.lat, longitude: c.location.lng }}
            title={c.name}
            description={`Wait: ${c.currentWaitMinutes} min · ${c.tags.join(', ')}`}
            pinColor={concessionMarkerColor(c.currentWaitMinutes)}
            onPress={() => onConcessionPress?.(c)}
          />
        ))}
      </MapView>

      {accessibleRouting && (
        <View style={styles.a11yBanner} accessibilityRole="alert">
          <Text style={styles.a11yText}>♿ Accessible routing active — showing accessible facilities only</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  a11yBanner: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  a11yText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
