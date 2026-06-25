import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { getPreferences } from '@/lib/storage';
import { theme } from '@/constants/theme';

export default function Entry() {
  const router = useRouter();

  useEffect(() => {
    getPreferences().then((prefs) => {
      if (prefs?.onboardingComplete) {
        router.replace('/(tabs)' as any);
      } else {
        router.replace('/(onboarding)/splash' as any);
      }
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={theme.colors.accent} />
    </View>
  );
}
