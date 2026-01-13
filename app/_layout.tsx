import '../global.css';

import { supabase } from '@/utils/supabase';
import { Slot, usePathname, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  // 🔐 Prevent redirect during HMR rehydration
  const hydrated = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      hydrated.current = true;
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Ignore initial HMR reset
        if (!hydrated.current) return;

        if (event === 'SIGNED_IN') {
          setHasSession(true);
        }

        if (event === 'SIGNED_OUT') {
          setHasSession(false);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading || hasSession === null) return;

    if (!hasSession && !pathname.startsWith('/(auth)')) {
      router.replace('/(auth)/login');
    }

    if (hasSession && pathname.startsWith('/(auth)')) {
      router.replace('/(tabs)');
    }
  }, [hasSession, loading, pathname]);

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="white" />
      </View>
    );
  }

  return <Slot />;
}