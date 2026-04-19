import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useRealTimeWait } from '../src/hooks/useRealTimeWait';
import { useAuthStore } from '../src/store/useAuthStore';
import { useAccessibilityStore } from '../src/store/useAccessibilityStore';
import GateWaitCard from '../src/components/GateWaitCard';
import ConcessionWaitOverlay from '../src/components/ConcessionWaitOverlay';
import VenueMap from '../src/components/VenueMap';

type Tab = 'gates' | 'concessions' | 'map';

export default function Home() {
  const { gates, concessions, connected } = useRealTimeWait();
  const { user } = useAuthStore();
  const { accessibleRouting } = useAccessibilityStore();
  const [activeTab, setActiveTab] = useState<Tab>('gates');

  return (
    <SafeAreaView style={styles.container}>
      {/* Connection status */}
      <View style={[styles.connBar, connected ? styles.connOk : styles.connOff]}>
        <Text style={styles.connText}>
          {connected ? '● Live' : '○ Reconnecting…'}
        </Text>
        {accessibleRouting && (
          <Text style={styles.connText}>♿ Accessible mode</Text>
        )}
      </View>

      {/* Welcome */}
      <View style={styles.welcome}>
        <Text style={styles.title}>My Game Hub</Text>
        <Text style={styles.subtitle}>
          {user?.isAnonymous ? 'Guest Fan' : user?.displayName ?? 'Welcome'}
        </Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabs}>
        {(['gates', 'concessions', 'map'] as Tab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
            accessibilityLabel={`${tab} tab`}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'gates' ? '🚪 Gates' : tab === 'concessions' ? '🍔 F&B' : '🗺️ Map'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab content */}
      {activeTab === 'gates' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {gates.length === 0 ? (
            <Text style={styles.empty}>Waiting for gate data…</Text>
          ) : (
            gates.map((gate) => (
              <GateWaitCard key={gate.id} gate={gate} />
            ))
          )}
        </ScrollView>
      )}

      {activeTab === 'concessions' && (
        <View style={styles.content}>
          {concessions.length === 0 ? (
            <Text style={styles.empty}>Waiting for concession data…</Text>
          ) : (
            <ConcessionWaitOverlay concessions={concessions} />
          )}
        </View>
      )}

      {activeTab === 'map' && (
        <View style={styles.mapContainer}>
          <VenueMap gates={gates} concessions={concessions} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  connBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  connOk: { backgroundColor: '#064E3B' },
  connOff: { backgroundColor: '#7F1D1D' },
  connText: {
    color: '#D1FAE5',
    fontSize: 12,
    fontWeight: '600',
  },
  welcome: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1E1E2E',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mapContainer: {
    flex: 1,
  },
  empty: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
});
