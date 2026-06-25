import type { Curiosity, Category, Angle, SurpriseType } from '@/types';
import { getAllCuriosities } from './curiositiesCache';

export async function buildCuriosityPool(
  categories: Category[],
  angle: Angle,
  shareType: SurpriseType
): Promise<Curiosity[]> {
  const all = await getAllCuriosities();

  const preferred = all.filter(
    (c) => categories.includes(c.category) && c.angle === angle && c.surprise_type === shareType
  );

  const fallback = all.filter(
    (c) => categories.includes(c.category) && !preferred.some((p) => p.id === c.id)
  );

  return [...preferred, ...fallback];
}

export async function pickPreviewItem(
  categories: Category[],
  angle: Angle,
  shareType: SurpriseType
): Promise<Curiosity | null> {
  const pool = await buildCuriosityPool(categories, angle, shareType);
  if (pool.length > 0) return pool[0];
  const all = await getAllCuriosities();
  return all[0] ?? null;
}
