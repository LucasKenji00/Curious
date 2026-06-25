import type { Curiosity, Category, Angle, SurpriseType } from '@/types';
import allCuriosities from '@/data/curiosities.json';

const ALL_CURIOSITIES = allCuriosities as Curiosity[];

/**
 * Monta o pool de curiosidades pra um conjunto de preferências.
 * Prioriza itens que combinam com categoria + angle + shareType; usa
 * "apenas categoria" como fallback pra não deixar o pool vazio.
 *
 * Usado por: lib/notifications.ts (agendar notificações), app/(tabs)/index.tsx
 * (tela Today) e app/(onboarding)/preview.tsx (preview do onboarding).
 */
export function buildCuriosityPool(
  categories: Category[],
  angle: Angle,
  shareType: SurpriseType
): Curiosity[] {
  const preferred = ALL_CURIOSITIES.filter(
    (c) => categories.includes(c.category) && c.angle === angle && c.surprise_type === shareType
  );

  const fallback = ALL_CURIOSITIES.filter(
    (c) => categories.includes(c.category) && !preferred.some((p) => p.id === c.id)
  );

  return [...preferred, ...fallback];
}

/**
 * Pega um único item representativo pra mostrar no preview do onboarding.
 * Não marca como visto — é só uma amostra do que a pessoa vai receber.
 */
export function pickPreviewItem(
  categories: Category[],
  angle: Angle,
  shareType: SurpriseType
): Curiosity | null {
  const pool = buildCuriosityPool(categories, angle, shareType);
  return pool[0] ?? ALL_CURIOSITIES[0] ?? null;
}
