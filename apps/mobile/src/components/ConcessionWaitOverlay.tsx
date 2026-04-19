/**
 * ConcessionWaitOverlay — scrollable list of F&B / restroom facilities
 * with live wait-times and category filtering.
 *
 * Designed to be rendered inside a bottom-sheet or
 * overlaid on the VenueMap component.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import type { Concession, ConcessionCategory } from '@venuexp/shared';

interface Props {
  concessions: Concession[];
  onSelect?: (concession: Concession) => void;
}

const CATEGORIES: { label: string; value: ConcessionCategory | 'all' }[] = [
  { label: 'All',         value: 'all' },
  { label: '🍔 Food',     value: 'food' },
  { label: '🥤 Drinks',   value: 'beverage' },
  { label: '🚻 Restroom', value: 'restroom' },
  { label: '🛍️ Merch',    value: 'merchandise' },
];

function waitColor(minutes: number): string {
  if (minutes >= 15) return '#EF4444';
  if (minutes >= 8)  return '#F59E0B';
  return '#10B981';
}

export default function ConcessionWaitOverlay({ concessions, onSelect }: Props) {
  const [filter, setFilter] = useState<ConcessionCategory | 'all'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return concessions;
    return concessions.filter((c) => c.category === filter);
  }, [concessions, filter]);

  return (
    <View style={styles.container}>
      {/* Category pills */}
      <View style={styles.pills}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.value}
            onPress={() => setFilter(cat.value)}
            style={[styles.pill, filter === cat.value && styles.pillActive]}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${cat.label}`}
            accessibilityState={{ selected: filter === cat.value }}
          >
            <Text style={[styles.pillText, filter === cat.value && styles.pillTextActive]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Concession list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect?.(item)}
            style={styles.card}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, wait ${item.currentWaitMinutes} minutes, ${item.isOpen ? 'open' : 'closed'}`}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              {item.isAccessible && <Text style={styles.a11y}>♿</Text>}
            </View>

            <View style={styles.cardRow}>
              <View style={[styles.waitBadge, { backgroundColor: waitColor(item.currentWaitMinutes) }]}>
                <Text style={styles.waitText}>
                  {item.isOpen ? `${item.currentWaitMinutes} min` : 'CLOSED'}
                </Text>
              </View>
              <Text style={styles.floor}>Floor {item.floor}</Text>
              {item.tags.length > 0 && (
                <Text style={styles.tags}>{item.tags.join(' · ')}</Text>
              )}
            </View>
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pills: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#2A2A3C',
  },
  pillActive: {
    backgroundColor: '#6366F1',
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2A3C',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  a11y: { fontSize: 16, marginLeft: 6 },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  waitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 16,
  },
  waitText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  floor: {
    color: '#94A3B8',
    fontSize: 12,
  },
  tags: {
    color: '#64748B',
    fontSize: 11,
    fontStyle: 'italic',
  },
});
