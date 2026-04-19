import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ActivityIndicator, View, Pressable, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/store/useAuthStore';
import { useAccessibilityStore } from '../src/store/useAccessibilityStore';

export default function RootLayout() {
  const { listen, loading, user, signInAnon } = useAuthStore();
  const { accessibleRouting, toggleAccessibleRouting } = useAccessibilityStore();

  // Subscribe to Firebase auth changes on mount
  useEffect(() => {
    const unsubscribe = listen();
    return unsubscribe;
  }, []);

  // Auto sign-in anonymously if no user after auth has loaded
  useEffect(() => {
    if (!loading && !user) {
      signInAnon();
    }
  }, [loading, user]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0F0F1A' },
        headerTintColor: '#E2E8F0',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#0F0F1A' },
        headerRight: () => (
          <Pressable
            onPress={toggleAccessibleRouting}
            style={[styles.a11yToggle, accessibleRouting && styles.a11yToggleActive]}
            accessibilityRole="switch"
            accessibilityLabel="Toggle accessible routing mode"
            accessibilityState={{ checked: accessibleRouting }}
          >
            <Text style={styles.a11yToggleText}>♿</Text>
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: 'VenueXP' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F1A',
  },
  a11yToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2A3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  a11yToggleActive: {
    backgroundColor: '#6366F1',
  },
  a11yToggleText: {
    fontSize: 18,
  },
});

