import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function GradientButton({ label, onPress, disabled, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.88}
      style={[styles.wrapper, disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.45,
  },
  gradient: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.buttonPrimaryText,
    letterSpacing: -0.2,
  },
});
