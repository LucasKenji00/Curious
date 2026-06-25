import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';

interface Props {
  streakCount: number;
  visible: boolean;
}

export function StreakToast({ streakCount, visible }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.sequence([
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(3000),
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: -120,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [visible]);

  const message =
    streakCount === 1
      ? 'Day 1 — your journey starts today 🔥'
      : `🔥 ${streakCount} day streak — keep it going!`;

  return (
    <Animated.View
      style={[
        styles.toast,
        { top: insets.top + theme.spacing.sm, transform: [{ translateY }], opacity },
      ]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.text}>{message}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: theme.spacing.xl,
    right: theme.spacing.xl,
    zIndex: 999,
    borderRadius: theme.radius.pill,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  text: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
