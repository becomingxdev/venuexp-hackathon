/**
 * GateWaitCard — renders a single gate with live wait-time,
 * color-coded capacity badge, and accessibility indicator.
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { Gate } from '@venuexp/shared';

interface Props {
  gate: Gate;
  onPress?: (gate: Gate) => void;
}

function capacityColor(pct: number): string {
  if (pct >= 85) return '#EF4444'; // red — critical
  if (pct >= 60) return '#F59E0B'; // amber — busy
  return '#10B981';                // green — clear
}

function statusLabel(gate: Gate): string {
  if (gate.status === 'closed') return 'CLOSED';
  if (gate.status === 'at-capacity') return 'AT CAPACITY';
  return `${gate.currentWaitMinutes} min`;
}

export default function GateWaitCard({ gate, onPress }: Props) {
  const color = capacityColor(gate.capacityPercent);

  return (
    <Pressable
      onPress={() => onPress?.(gate)}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${gate.name}, wait time ${gate.currentWaitMinutes} minutes, capacity ${gate.capacityPercent} percent`}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{gate.name}</Text>
        {gate.isAccessible && (
          <Text style={styles.a11yBadge} accessibilityLabel="Accessible gate">♿</Text>
        )}
      </View>

      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{statusLabel(gate)}</Text>
        </View>
        <Text style={styles.capacity}>{gate.capacityPercent}% full</Text>
      </View>

      <Text style={styles.updated}>
        Updated {new Date(gate.lastUpdated).toLocaleTimeString()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E2E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A3C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  a11yBadge: {
    fontSize: 18,
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  capacity: {
    color: '#94A3B8',
    fontSize: 13,
  },
  updated: {
    color: '#64748B',
    fontSize: 11,
  },
});
