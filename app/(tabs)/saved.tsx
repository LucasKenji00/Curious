import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { CuriosityCard } from '@/components/CuriosityCard';
import { getSavedCuriosities, clearAll } from '@/lib/storage';
import { theme } from '@/constants/theme';
import type { Curiosity, Category } from '@/types';

const FILTER_ALL = 'All' as const;
type Filter = typeof FILTER_ALL | Category;

export default function SavedScreen() {
  const router = useRouter();
  const [saved, setSaved] = useState<Curiosity[]>([]);
  const [filter, setFilter] = useState<Filter>(FILTER_ALL);

  useFocusEffect(
    useCallback(() => {
      getSavedCuriosities().then(setSaved);
    }, [])
  );

  async function devReset() {
    await clearAll();
    router.replace('/(onboarding)/splash' as any);
  }

  const categories = [FILTER_ALL, ...new Set(saved.map((s) => s.category))] as Filter[];
  const displayed = filter === FILTER_ALL ? saved : saved.filter((s) => s.category === filter);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.count}>
          {saved.length} {saved.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {saved.length > 0 && categories.length > 2 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          style={styles.filterRow}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setFilter(cat)}
              style={[styles.filterPill, filter === cat && styles.filterPillActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>
                {cat === FILTER_ALL ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {displayed.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>◇</Text>
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptyBody}>
              Tap the bookmark on any curiosity to save it here.
            </Text>
            {__DEV__ && (
              <TouchableOpacity onPress={devReset} style={styles.devReset}>
                <Text style={styles.devResetText}>↺ Reset onboarding (dev)</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.cards}>
            {displayed.map((item) => (
              <CuriosityCard
                key={item.id}
                item={item}
                onSaveChange={() => getSavedCuriosities().then(setSaved)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl + theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  count: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textMuted,
  },
  filterRow: { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  filters: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterPill: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs + 2,
  },
  filterPillActive: {
    backgroundColor: theme.colors.pillBackground,
    borderColor: theme.colors.pillBorder,
  },
  filterText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textMuted,
  },
  filterTextActive: { color: theme.colors.pillText },
  scroll: { padding: theme.spacing.xl, paddingBottom: theme.spacing.xxl },
  cards: { gap: theme.spacing.lg },
  empty: { alignItems: 'center', paddingTop: theme.spacing.xxl * 2, gap: theme.spacing.lg },
  emptyIcon: { fontSize: 40, color: theme.colors.textMuted },
  emptyTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textSecondary,
  },
  emptyBody: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: theme.typography.sizes.base * theme.typography.lineHeights.relaxed,
  },
  devReset: {
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
  },
  devResetText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
  },
});
