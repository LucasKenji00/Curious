import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import type { Category } from '@/types';

const GLYPH: Record<Category, string> = {
  'science & nature': '◉',
  'psychology': '◎',
  'history & politics': '◈',
  'philosophy': '◐',
  'technology': '◆',
  'art & culture': '◍',
  'economics & society': '◑',
  'language & words': '◌',
};

interface Props {
  category: Category;
  selected: boolean;
  onPress: () => void;
}

export function CategoryCard({ category, selected, onPress }: Props) {
  const display = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <Text style={[styles.icon, selected && styles.iconSelected]}>
        {GLYPH[category]}
      </Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {display}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 80,
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  cardSelected: {
    borderColor: theme.colors.pillBorder,
    backgroundColor: theme.colors.pillBackground,
  },
  icon: {
    fontSize: 20,
    color: theme.colors.textMuted,
  },
  iconSelected: {
    color: theme.colors.accent,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  labelSelected: {
    color: theme.colors.pillText,
  },
});
