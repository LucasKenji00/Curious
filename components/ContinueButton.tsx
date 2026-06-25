import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';

interface Props {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function ContinueButton({ label = 'Continue', onPress, disabled, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.88}
      style={[styles.btn, disabled && styles.disabled, style]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: theme.colors.buttonPrimary,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: theme.colors.backgroundElevated,
  },
  label: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.buttonPrimaryText,
    letterSpacing: -0.2,
  },
  labelDisabled: {
    color: theme.colors.textMuted,
  },
});
