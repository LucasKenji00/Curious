import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ProgressBar } from '@/components/ProgressBar';
import { ContinueButton } from '@/components/ContinueButton';
import { theme } from '@/constants/theme';
import { getPreferences, savePreferences } from '@/lib/storage';
import type { NotificationFrequency } from '@/types';

export default function FrequencyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const isEditMode = params.editMode === 'true';
  const [frequency, setFrequency] = useState<NotificationFrequency>(3);
  const [startTime] = useState('09:00');
  const [endTime] = useState('22:00');

  useEffect(() => {
    if (isEditMode) {
      getPreferences().then((p) => {
        if (p) setFrequency(p.notifFrequency);
      });
    }
  }, []);

  function dec() { setFrequency((f) => Math.max(1, f - 1) as NotificationFrequency); }
  function inc() { setFrequency((f) => Math.min(5, f + 1) as NotificationFrequency); }

  async function handleContinue() {
    if (isEditMode) {
      const prefs = await getPreferences();
      if (prefs) {
        await savePreferences({ ...prefs, notifFrequency: frequency, startTime, endTime });
      }
      router.back();
      return;
    }
    router.push({
      pathname: '/(onboarding)/preview' as any,
      params: { ...params, notifFrequency: String(frequency), startTime, endTime },
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      {isEditMode ? (
        <View style={styles.editHeader}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.editTitle}>Notifications</Text>
          <View style={{ width: 50 }} />
        </View>
      ) : (
        <View style={styles.progressRow}>
          <ProgressBar current={6} total={7} />
        </View>
      )}

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>How curious are you?</Text>
          <Text style={styles.subtitle}>You can always change this later.</Text>
        </View>
        <View style={styles.rows}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Ideas per day</Text>
            <View style={styles.counter}>
              <TouchableOpacity onPress={dec} style={styles.counterBtn} activeOpacity={0.7}>
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{frequency}</Text>
              <TouchableOpacity onPress={inc} style={styles.counterBtn} activeOpacity={0.7}>
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Start at</Text>
            <Text style={styles.rowValue}>{startTime}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>End at</Text>
            <Text style={styles.rowValue}>{endTime}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <ContinueButton
          label={isEditMode ? 'Save' : 'Continue'}
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  progressRow: { paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  editTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  cancelText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    width: 50,
  },
  container: { flex: 1, paddingHorizontal: theme.spacing.xl, gap: theme.spacing.xl },
  header: { gap: theme.spacing.sm },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
  },
  rows: { gap: theme.spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  rowLabel: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
  rowValue: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
  },
  counter: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  counterValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },
  footer: { paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xl, paddingTop: theme.spacing.sm },
});
