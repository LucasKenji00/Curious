import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { CuriosityCard } from '@/components/CuriosityCard';
import { StreakToast } from '@/components/StreakToast';
import { getPreferences, pickUnseen, markAsSeen, updateStreak } from '@/lib/storage';
import { buildCuriosityPool } from '@/lib/curiosities';
import { theme } from '@/constants/theme';
import type { Curiosity, Category, NotificationFrequency, Angle, SurpriseType } from '@/types';

async function loadTodaysCuriosities(
  categories: Category[],
  frequency: NotificationFrequency,
  angle: Angle,
  shareType: SurpriseType
): Promise<Curiosity[]> {
  const pool = await buildCuriosityPool(categories, angle, shareType);
  const picks = await pickUnseen(pool, frequency);
  await markAsSeen(picks.map((c) => c.id));
  return picks;
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function TodayScreen() {
  const router = useRouter();
  const [curiosities, setCuriosities] = useState<Curiosity[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [showStreak, setShowStreak] = useState(false);

  // Run streak check once on mount (app open), with 1s delay for the toast
  useEffect(() => {
    const timer = setTimeout(async () => {
      const result = await updateStreak();
      if (result.isNewDay) {
        setStreakCount(result.streakCount);
        setShowStreak(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  async function load() {
    setLoading(true);
    const prefs = await getPreferences();
    if (!prefs) { setLoading(false); return; }
    setUserName(prefs.userName ?? '');
    const items = await loadTodaysCuriosities(
      prefs.categories,
      prefs.notifFrequency,
      prefs.angle,
      prefs.shareType
    );
    setCuriosities(items);
    setLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StreakToast visible={showStreak} streakCount={streakCount} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.accent}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.date}>{formatDate()}</Text>
            <TouchableOpacity onPress={() => router.navigate('/(tabs)/profile' as any)} hitSlop={12}>
              <Feather name="settings" size={20} color={theme.colors.settingsIcon} />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>
            {userName ? `${userName}'s\ncuriosities.` : "Today's\ncuriosities."}
          </Text>
        </View>

        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>◌</Text>
            <Text style={styles.emptyText}>Loading your curiosities…</Text>
          </View>
        ) : curiosities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>◇</Text>
            <Text style={styles.emptyText}>No curiosities match your preferences.</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh or adjust your categories in Profile.</Text>
          </View>
        ) : (
          <>
            <View style={styles.cards}>
              {curiosities.map((item) => (
                <CuriosityCard key={item.id} item={item} />
              ))}
            </View>
            <Text style={styles.hint}>Pull down for a new selection</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: theme.spacing.xl, paddingBottom: theme.spacing.xxl },
  header: { gap: theme.spacing.sm, marginBottom: theme.spacing.xl, marginTop: theme.spacing.md },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    lineHeight: theme.typography.sizes.xxl * theme.typography.lineHeights.tight,
    color: theme.colors.textPrimary,
  },
  cards: { gap: theme.spacing.lg },
  hint: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxl * 2,
    gap: theme.spacing.md,
  },
  emptyIcon: {
    fontSize: 40,
    color: theme.colors.textMuted,
  },
  emptyText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.relaxed,
  },
});
