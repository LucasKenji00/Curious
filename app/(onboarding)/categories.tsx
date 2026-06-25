import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ProgressBar } from '@/components/ProgressBar';
import { ContinueButton } from '@/components/ContinueButton';
import { SelectionPill } from '@/components/SelectionPill';
import { theme } from '@/constants/theme';
import { getPreferences, savePreferences } from '@/lib/storage';
import { ALL_CATEGORIES, type Category } from '@/types';

const LABEL: Record<Category, string> = {
  'science & nature': 'Science & Nature',
  'psychology': 'Psychology',
  'history & politics': 'History & Politics',
  'philosophy': 'Philosophy',
  'technology': 'Technology',
  'art & culture': 'Art & Culture',
  'economics & society': 'Economics & Society',
  'language & words': 'Language & Words',
};

export default function CategoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userName?: string; editMode?: string }>();
  const isEditMode = params.editMode === 'true';
  const [selected, setSelected] = useState<Set<Category>>(new Set());

  useEffect(() => {
    if (isEditMode) {
      getPreferences().then((p) => {
        if (p) setSelected(new Set(p.categories));
      });
    }
  }, []);

  function toggle(cat: Category) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const canContinue = selected.size >= 2;

  async function handleContinue() {
    if (isEditMode) {
      const prefs = await getPreferences();
      if (prefs) await savePreferences({ ...prefs, categories: [...selected] });
      router.back();
      return;
    }
    router.push({
      pathname: '/(onboarding)/angle' as any,
      params: { userName: params.userName, categories: JSON.stringify([...selected]) },
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      {isEditMode ? (
        <View style={styles.editHeader}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.editTitle}>Categories</Text>
          <View style={{ width: 50 }} />
        </View>
      ) : (
        <View style={styles.progressRow}>
          <ProgressBar current={2} total={7} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>What fascinates you?</Text>
          <Text style={styles.subtitle}>Pick at least 2.</Text>
        </View>

        <View style={styles.pillGrid}>
          {ALL_CATEGORIES.map((cat) => (
            <SelectionPill
              key={cat}
              label={LABEL[cat]}
              selected={selected.has(cat)}
              onPress={() => toggle(cat)}
              variant="tag"
            />
          ))}
        </View>

        {selected.size === 1 && (
          <Text style={styles.hint}>Pick one more to continue</Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <ContinueButton
          label={isEditMode ? 'Save' : 'Continue'}
          onPress={handleContinue}
          disabled={!canContinue}
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
  scroll: { paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xxl, gap: theme.spacing.xl },
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
  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  hint: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
