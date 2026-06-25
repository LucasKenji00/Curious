import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ProgressBar } from '@/components/ProgressBar';
import { ContinueButton } from '@/components/ContinueButton';
import { SelectionPill } from '@/components/SelectionPill';
import { theme } from '@/constants/theme';
import type { SocialRole } from '@/types';

const OPTIONS: { value: SocialRole; label: string }[] = [
  { value: 'asks_questions', label: 'The one who asks questions' },
  { value: 'tells_stories', label: 'The one who tells stories' },
  { value: 'connects_dots', label: 'The one who connects the dots' },
  { value: 'listens', label: 'The one who listens' },
];

export default function SocialRoleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const [selected, setSelected] = useState<SocialRole | null>(null);

  function handleContinue() {
    router.push({ pathname: '/(onboarding)/share-trigger' as any, params: { ...params, socialRole: selected! } });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.progressRow}>
        <ProgressBar current={4} total={7} />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>At a dinner,{'\n'}you're usually…</Text>
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
