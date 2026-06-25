import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

type Variant = 'tag' | 'row';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  variant?: Variant;
}

export function SelectionPill({ label, selected, onPress, variant = 'tag' }: Props) {
  if (variant === 'row') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={[styles.row, selected && styles.rowSelected]}
      >
        <Text style={[styles.rowLabel, selected && styles.rowLabelSelected]}>
          {label}
        </Text>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.tag, selected && styles.tagSelected]}
    >
      {selected && <Text style={styles.checkmark}>✓ </Text>}
      <Text style={[styles.tagLabel, selected && styles.tagLabelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Tag variant
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundCard,
  },
  tagSelected: {
    borderColor: theme.colors.pillBorder,
    backgroundColor: theme.colors.pillBackground,
  },
  checkmark: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.pillText,
  },
  tagLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  tagLabelSelected: {
    color: theme.colors.pillText,
  },

  // Row variant
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundCard,
  },
  rowSelected: {
    borderColor: theme.colors.pillBorder,
    backgroundColor: theme.colors.pillBackground,
  },
  rowLabel: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  rowLabelSelected: {
    color: theme.colors.textPrimary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.lg,
  },
  radioSelected: {
    borderColor: theme.colors.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
  },
});
