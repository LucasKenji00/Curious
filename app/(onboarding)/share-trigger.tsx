import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ProgressBar } from '@/components/ProgressBar';
import { ContinueButton } from '@/components/ContinueButton';
import { SelectionPill } from '@/components/SelectionPill';
import { theme } from '@/constants/theme';
import type { SurpriseType } from '@/types';

const OPTIONS: { value: SurpriseType; label: string }[] = [
  { value: 'nobody_knows', label: "It's something nobody knows" },
  { value: 'challenges_belief', label: 'It challenges what I believed' },
  { value: 'explains_wonder', label: 'It explains something I always wondered' },
  { value: 'wildly_unexpected', label: "It's just wildly unexpected" },
];

export default function ShareTriggerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const [selected, setSelected] = useState<SurpriseType | null>(null);

  function handleContinue() {
    router.push({ pathname: '/(onboarding)/frequency' as any, params: { ...params, shareType: selected! } });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.progressRow}>
        <ProgressBar current={5} total={7} />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>What would make you share{'\n'}something you just learned?</Text>
        <View style={styles.options}>
          {OPTIONS.map((opt) => (
            <SelectionPill key={opt.value} label={opt.label} selected={selected === opt.value} onPress={() => setSelected(opt.value)} variant="row" />
          ))}
        </View>
      </View>
      <View style={styles.footer}>
        <ContinueButton onPress={handleContinue} disabled={!selected} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  progressRow: { paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  container: { flex: 1, paddingHorizontal: theme.spacing.xl, gap: theme.spacing.xl },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    lineHeight: theme.typography.sizes.xxl * theme.typography.lineHeights.tight,
    color: theme.colors.textPrimary,
  },
  options: { gap: theme.spacing.sm },
  footer: { paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xl, paddingTop: theme.spacing.sm },
});
