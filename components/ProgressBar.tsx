import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  const pct = Math.min(current / total, 1);
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 3,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginHorizontal: theme.spacing.lg,
  },
  fill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
  },
});
