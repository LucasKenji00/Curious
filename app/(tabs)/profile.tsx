import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Share,
  Image,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/constants/theme';
import { getPreferences, savePreferences, getStreakData, clearAll } from '@/lib/storage';
import type { UserPreferences } from '@/types';
import type { StreakData } from '@/lib/storage';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'C';
}

function getLast7Days(openDates: string[]): { date: string; label: string; done: boolean }[] {
  const openSet = new Set(openDates);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const date = d.toISOString().split('T')[0];
    return {
      date,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1),
      done: openSet.has(date),
    };
  });
}

interface RowProps {
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
}

function SettingsRow({ label, onPress, right }: RowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      {right ?? <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [streak, setStreak] = useState<StreakData>({ lastOpenDate: '', streakCount: 0, openDates: [] });
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const nameInputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const p = await getPreferences();
        if (p) {
          setPrefs(p);
          setNameInput(p.userName);
          setPhotoUri(p.photoUri ?? null);
        }
        const s = await getStreakData();
        setStreak(s);
      }
      load();
    }, [])
  );

  async function saveName() {
    if (!prefs) return;
    const updated = { ...prefs, userName: nameInput.trim() };
    await savePreferences(updated);
    setPrefs(updated);
    setEditingName(false);
  }

  function startEditName() {
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  }

  async function handlePickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      if (prefs) {
        const updated = { ...prefs, photoUri: uri };
        await savePreferences(updated);
        setPrefs(updated);
      }
    }
  }

  async function handleRate() {
    const available = await StoreReview.isAvailableAsync();
    if (available) await StoreReview.requestReview();
  }

  async function handleShare() {
    await Share.share({
      message:
        'I\'ve been using Curious to learn something new every day 🧠✨\n\nhttps://curious.app',
    });
  }

  const userName = prefs?.userName ?? '';
  const initials = getInitials(userName || 'C');
  const days7 = getLast7Days(streak.openDates);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar & name */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.8}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarPhoto} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Feather name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.nameRow}>
            {editingName ? (
              <TextInput
                ref={nameInputRef}
                value={nameInput}
                onChangeText={setNameInput}
                onSubmitEditing={saveName}
                onBlur={saveName}
                style={styles.nameInput}
                returnKeyType="done"
                autoCapitalize="words"
              />
            ) : (
              <Text style={styles.nameText}>{userName || 'Add your name'}</Text>
            )}
            <TouchableOpacity onPress={editingName ? saveName : startEditName} hitSlop={8}>
              <Text style={styles.editLink}>{editingName ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Streak card */}
        <View style={styles.streakCard}>
          <Text style={styles.sectionLabel}>Your streak</Text>

          <View style={styles.streakBody}>
            <View style={styles.flameWrap}>
              <Text style={styles.flameEmoji}>🔥</Text>
              <View style={styles.streakBadge}>
                <Text style={styles.streakBadgeText}>{streak.streakCount}</Text>
              </View>
            </View>
            <View style={styles.streakMeta}>
              <Text style={styles.streakCountLabel}>
                {streak.streakCount} {streak.streakCount === 1 ? 'day streak' : 'day streak'}
              </Text>
              <Text style={styles.streakSub}>Keep it going!</Text>
            </View>
          </View>

          <View style={styles.days7Row}>
            {days7.map((d) => (
              <View key={d.date} style={styles.dayCell}>
                <View style={[styles.dayDot, d.done && styles.dayDotDone]}>
                  {d.done && <Feather name="check" size={10} color={theme.colors.background} />}
                </View>
                <Text style={styles.dayLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* My preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My preferences</Text>
          <View style={styles.sectionGroup}>
            <SettingsRow
              label="Change categories"
              onPress={() =>
                router.push({
                  pathname: '/(onboarding)/categories' as any,
                  params: { editMode: 'true' },
                })
              }
            />
            <View style={styles.rowDivider} />
            <SettingsRow
              label="Notification settings"
              onPress={() =>
                router.push({
                  pathname: '/(onboarding)/frequency' as any,
                  params: { editMode: 'true' },
                })
              }
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionGroup}>
            <SettingsRow
              label="Name"
              onPress={startEditName}
              right={
                <Text style={styles.rowValue} numberOfLines={1}>
                  {userName || '—'}
                </Text>
              }
            />
            <View style={styles.rowDivider} />
            <SettingsRow
              label="Profile photo"
              onPress={handlePickPhoto}
              right={
                photoUri
                  ? <Feather name="check-circle" size={16} color={theme.colors.accent} />
                  : <Text style={styles.rowMuted}>Add photo</Text>
              }
            />
          </View>
        </View>

        {/* App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.sectionGroup}>
            <SettingsRow label="Rate Curious ⭐" onPress={handleRate} />
            <View style={styles.rowDivider} />
            <SettingsRow label="Share Curious" onPress={handleShare} />
            <View style={styles.rowDivider} />
            <SettingsRow label="About" onPress={() => router.push('/about' as any)} />
          </View>
        </View>

        {/* Dev testing — hidden in production */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.resetButton}
            activeOpacity={0.7}
            onPress={async () => {
              await clearAll();
              router.replace('/(onboarding)/splash' as any);
            }}
          >
            <Text style={styles.resetButtonText}>Reset — restart from beginning</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.xl,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  avatarText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.accent,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  nameText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  nameInput: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.accent,
    minWidth: 120,
    paddingVertical: 2,
  },
  editLink: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.accent,
    fontWeight: theme.typography.weights.medium,
  },

  // Streak card
  streakCard: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  streakBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  flameWrap: {
    position: 'relative',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameEmoji: {
    fontSize: 44,
    lineHeight: 52,
  },
  streakBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: theme.colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  streakBadgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.background,
  },
  streakMeta: { gap: 2 },
  streakCountLabel: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  streakSub: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  days7Row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: { alignItems: 'center', gap: 6 },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotDone: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  dayLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
  },

  // Settings sections
  section: { gap: theme.spacing.sm },
  sectionTitle: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    paddingHorizontal: theme.spacing.xs,
  },
  sectionGroup: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  rowLabel: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.medium,
  },
  rowValue: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    maxWidth: 160,
  },
  rowMuted: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
  },
  rowDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.xl,
  },
  resetButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: '#ff4444',
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: '#ff4444',
    fontWeight: theme.typography.weights.medium,
  },
});
