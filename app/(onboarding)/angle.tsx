import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ProgressBar } from '@/components/ProgressBar';
import { ContinueButton } from '@/components/ContinueButton';
import { SelectionPill } from '@/components/SelectionPill';
import { theme } from '@/constants/theme';
import type { Angle } from '@/types';

const OPTIONS: { value: Angle; label: string }[] = [
  { value: 'how_did_we_get_here', label: 'How did we get here?' },
  { value: 'why_people_act', label: 'Why do people act like this?' },
  { value: 'whats_coming_next', label: "What's coming next?" },
  { value: 'who_has_power', label: 'Who really has the power?' },
];

export default function AngleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const [selected, setSelected] = useState<Angle | null>(null);

  function handleContinue() {
    router.push({ pathname: '/(onboarding)/social-role' as any, params: { ...params, angle: selected! } });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.progressRow}>
        <ProgressBar current={3} total={7} />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>What kind of question{'\n'}keeps you up at night?</Text>
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
