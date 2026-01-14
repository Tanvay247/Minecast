import "react-native-get-random-values";

import { supabase } from '@/utils/supabase';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  MD3DarkTheme,
  Provider as PaperProvider,
} from 'react-native-paper';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#ff0050',
    secondary: '#ffffff',
    background: '#000000',
    surface: '#111111',
    text: '#ffffff',
  },
};

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments(); // ✅ IMPORTANT

  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  const hydrated = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      hydrated.current = true;
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (!hydrated.current) return;
        if (event === 'SIGNED_IN') setHasSession(true);
        if (event === 'SIGNED_OUT') setHasSession(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!hydrated.current || loading || hasSession === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    // 🔒 Not logged in → auth
    if (!hasSession && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    // ✅ Logged in → tabs
    if (hasSession && !inTabsGroup) {
      router.replace('/(tabs)');
    }
  }, [segments, hasSession, loading]);

  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <View style={styles.loader}>
          <Text style={styles.logo}>MineCast</Text>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: 1,
  },
});