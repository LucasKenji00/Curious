import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import type { Curiosity } from '@/types';
import fallbackData from '@/data/curiosities.json';

const CACHE_KEY = 'curious:curiosities_cache';
const CACHE_TS_KEY = 'curious:curiosities_cache_ts';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface SupabaseRow {
  id: string;
  category: string;
  angle: string;
  surprise_type: string;
  hook: string;
  body: string;
  deep_dive: string | null;
  tags: string[];
}

function rowToCuriosity(row: SupabaseRow): Curiosity {
  return {
    id: row.id,
    category: row.category as Curiosity['category'],
    angle: row.angle as Curiosity['angle'],
    surprise_type: row.surprise_type as Curiosity['surprise_type'],
    hook: row.hook,
    body: row.body,
    deepDive: row.deep_dive ?? undefined,
    tags: row.tags,
  };
}

export async function getAllCuriosities(): Promise<Curiosity[]> {
  try {
    const [cachedRaw, tsRaw] = await Promise.all([
      AsyncStorage.getItem(CACHE_KEY),
      AsyncStorage.getItem(CACHE_TS_KEY),
    ]);

    const ts = tsRaw ? parseInt(tsRaw, 10) : 0;

    if (cachedRaw && Date.now() - ts < CACHE_TTL_MS) {
      return JSON.parse(cachedRaw) as Curiosity[];
    }

    const { data, error } = await supabase.from('curiosities').select('*');

    if (error || !data || data.length === 0) throw error ?? new Error('empty');

    const curiosities = (data as SupabaseRow[]).map(rowToCuriosity);

    await Promise.all([
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(curiosities)),
      AsyncStorage.setItem(CACHE_TS_KEY, String(Date.now())),
    ]);

    return curiosities;
  } catch {
    // stale cache
    try {
      const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedRaw) return JSON.parse(cachedRaw) as Curiosity[];
    } catch {}

    // local JSON fallback
    return fallbackData as Curiosity[];
  }
}
