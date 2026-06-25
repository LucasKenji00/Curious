import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserPreferences, Curiosity, SeenEntry } from '@/types';

const KEYS = {
  PREFERENCES: 'curious:preferences',
  SAVED: 'curious:saved',
  SEEN: 'curious:seen',
  STREAK: 'curious:streak',
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Preferences

export async function getPreferences(): Promise<UserPreferences | null> {
  const raw = await AsyncStorage.getItem(KEYS.PREFERENCES);
  return raw ? JSON.parse(raw) : null;
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
}

// Saved curiosities

export async function getSavedCuriosities(): Promise<Curiosity[]> {
  const raw = await AsyncStorage.getItem(KEYS.SAVED);
  return raw ? JSON.parse(raw) : [];
}

export async function saveCuriosity(item: Curiosity): Promise<void> {
  const saved = await getSavedCuriosities();
  if (!saved.find((s) => s.id === item.id)) {
    await AsyncStorage.setItem(KEYS.SAVED, JSON.stringify([...saved, item]));
  }
}

export async function unsaveCuriosity(id: string): Promise<void> {
  const saved = await getSavedCuriosities();
  await AsyncStorage.setItem(
    KEYS.SAVED,
    JSON.stringify(saved.filter((s) => s.id !== id))
  );
}

export async function isSaved(id: string): Promise<boolean> {
  const saved = await getSavedCuriosities();
  return saved.some((s) => s.id === id);
}

// Seen tracking (30-day rolling window)

export async function getSeenEntries(): Promise<SeenEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.SEEN);
  const all: SeenEntry[] = raw ? JSON.parse(raw) : [];
  const cutoff = Date.now() - THIRTY_DAYS_MS;
  return all.filter((e) => e.seenAt > cutoff);
}

export async function markAsSeen(ids: string[]): Promise<void> {
  const existing = await getSeenEntries();
  const newEntries = ids
    .filter((id) => !existing.some((e) => e.id === id))
    .map((id) => ({ id, seenAt: Date.now() }));
  await AsyncStorage.setItem(
    KEYS.SEEN,
    JSON.stringify([...existing, ...newEntries])
  );
}

export async function getSeenIds(): Promise<Set<string>> {
  const entries = await getSeenEntries();
  return new Set(entries.map((e) => e.id));
}

export async function pickUnseen(
  pool: Curiosity[],
  count: number
): Promise<Curiosity[]> {
  const seenIds = await getSeenIds();
  let unseen = pool.filter((c) => !seenIds.has(c.id));

  if (unseen.length < count) {
    const entries = await getSeenEntries();
    const sorted = [...entries].sort((a, b) => a.seenAt - b.seenAt);
    const keep = sorted.slice(Math.floor(sorted.length / 2));
    await AsyncStorage.setItem(KEYS.SEEN, JSON.stringify(keep));
    const refreshedIds = new Set(keep.map((e) => e.id));
    unseen = pool.filter((c) => !refreshedIds.has(c.id));
  }

  return unseen.slice(0, count);
}

export async function clearAll(): Promise<void> {
  await Promise.all(Object.values(KEYS).map((k) => AsyncStorage.removeItem(k)));
}

// Streak tracking

export interface StreakData {
  lastOpenDate: string;
  streakCount: number;
  openDates: string[];
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export async function getStreakData(): Promise<StreakData> {
  const raw = await AsyncStorage.getItem(KEYS.STREAK);
  if (!raw) return { lastOpenDate: '', streakCount: 0, openDates: [] };
  return JSON.parse(raw);
}

export async function updateStreak(): Promise<{ streakCount: number; isNewDay: boolean }> {
  const data = await getStreakData();
  const today = todayISO();

  if (data.lastOpenDate === today) {
    return { streakCount: data.streakCount, isNewDay: false };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const newCount = data.lastOpenDate === yesterdayStr ? data.streakCount + 1 : 1;
  const openDates = [...(data.openDates ?? []).filter((d: string) => d !== today), today].slice(-30);

  await AsyncStorage.setItem(
    KEYS.STREAK,
    JSON.stringify({ lastOpenDate: today, streakCount: newCount, openDates })
  );

  return { streakCount: newCount, isNewDay: true };
}
