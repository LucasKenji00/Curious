import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ProgressBar } from '@/components/ProgressBar';
import { ContinueButton } from '@/components/ContinueButton';
import { theme } from '@/constants/theme';

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const canContinue = name.trim().length > 0;

  function handleContinue() {
    router.push({ pathname: '/(onboarding)/categories' as any, params: { userName: name.trim() } });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.progressRow}>
          <ProgressBar current={1} total={7} />
        </View>

        <View style={styles.container}>
          <Text style={styles.title}>What do we call you?</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={theme.colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={() => { if (canContinue) handleContinue(); }}
          />
        </View>

        <View style={styles.footer}>
          <ContinueButton onPress={handleContinue} disabled={!canContinue} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  progressRow: { paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  container: { flex: 1, paddingHorizontal: theme.spacing.xl, gap: theme.spacing.xl },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  input: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
});
