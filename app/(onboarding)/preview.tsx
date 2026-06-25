import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ProgressBar } from '@/components/ProgressBar';
import { ContinueButton } from '@/components/ContinueButton';
import { CuriosityCard } from '@/components/CuriosityCard';
import { savePreferences } from '@/lib/storage';
import { pickPreviewItem } from '@/lib/curiosities';
import { requestPermissions, scheduleDailyNotifications } from '@/lib/notifications';
import { theme } from '@/constants/theme';
import type { Curiosity, Category, Angle, SurpriseType, SocialRole, NotificationFrequency } from '@/types';

export default function PreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const [preview, setPreview] = useState<Curiosity | null>(null);
  const [loading, setLoading] = useState(false);

  const userName = params.userName ?? '';
  const categories: Category[] = JSON.parse(params.categories ?? '[]');
  const angle = params.angle as Angle;
  const shareType = params.shareType as SurpriseType;

  useEffect(() => {
    setPreview(pickPreviewItem(categories, angle, shareType));
  }, []);

  async function handleStart() {
    setLoading(true);
    try {
      const socialRole = params.socialRole as SocialRole;
      const notifFrequency = parseInt(params.notifFrequency ?? '3', 10) as NotificationFrequency;
      const startTime = params.startTime ?? '09:00';
      const endTime = params.endTime ?? '22:00';

      await savePreferences({
        userName, categories, angle, socialRole, shareType,
        notifFrequency, startTime, endTime, onboardingComplete: true,
      });

      const granted = await requestPermissions();
      if (granted) {
        await scheduleDailyNotifications(categories, notifFrequency, angle, shareType, startTime, endTime);
      } else {
        Alert.alert(
          'Notifications off',
          'The real value is in ideas landing on your lock screen. Enable them in Settings any time.',
          [{ text: 'Got it' }]
        );
      }

      router.replace('/(tabs)' as any);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.progressRow}>
        <ProgressBar current={7} total={7} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {userName ? `Here's your first one, ${userName}.` : "Here's your first one."}
          </Text>
          <Text style={styles.subtitle}>
            This is what will land on your lock screen — every day.
          </Text>
        </View>

        {preview ? (
          <CuriosityCard item={preview} startExpanded />
        ) : (
          <ActivityIndicator color={theme.colors.accent} />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <ContinueButton
          label={loading ? 'Setting up…' : 'Start exploring'}
          onPress={handleStart}
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  progressRow: { paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  scroll: { paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xxl, gap: theme.spacing.xl },
  header: { gap: theme.spacing.sm },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    lineHeight: theme.typography.sizes.xxl * theme.typography.lineHeights.tight,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.sizes.base * theme.typography.lineHeights.relaxed,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
