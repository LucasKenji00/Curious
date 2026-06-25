import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientButton } from '@/components/GradientButton';
import { theme } from '@/constants/theme';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            Become the most interesting person in the room.
          </Text>
          <Text style={styles.subtitle}>
            One surprising idea a day. Science, history, psychology, and more.
          </Text>
        </View>
        <View style={styles.footer}>
          <GradientButton
            label="Let's go"
            onPress={() => router.push('/(onboarding)/name' as any)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.typography.sizes.hero,
    fontWeight: theme.typography.weights.bold,
    lineHeight: theme.typography.sizes.hero * theme.typography.lineHeights.tight,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    lineHeight: theme.typography.sizes.base * theme.typography.lineHeights.relaxed,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  footer: { paddingBottom: theme.spacing.xl },
});
