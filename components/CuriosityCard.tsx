import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  Share,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';
import { saveCuriosity, unsaveCuriosity, isSaved } from '@/lib/storage';
import type { Curiosity } from '@/types';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const CATEGORY_LABEL: Record<string, string> = {
  'science & nature': 'Science & Nature',
  'psychology': 'Psychology',
  'history & politics': 'History & Politics',
  'philosophy': 'Philosophy',
  'technology': 'Technology',
  'art & culture': 'Art & Culture',
  'economics & society': 'Economics & Society',
  'language & words': 'Language & Words',
};

type SharePlatform = 'whatsapp' | 'instagram' | 'twitter' | 'copy';

const SHARE_PLATFORMS: { key: SharePlatform; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { key: 'whatsapp', label: 'WhatsApp', icon: 'message-circle' },
  { key: 'instagram', label: 'Instagram', icon: 'instagram' },
  { key: 'twitter', label: 'X', icon: 'twitter' },
  { key: 'copy', label: 'Copy', icon: 'copy' },
];

function buildShareText(item: Curiosity): string {
  return `${item.hook}\n\n${item.body}\n\nvia Curious`;
}

interface Props {
  item: Curiosity;
  onSaveChange?: (saved: boolean) => void;
  startExpanded?: boolean;
}

export function CuriosityCard({ item, onSaveChange, startExpanded = false }: Props) {
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(startExpanded);
  const [justCopied, setJustCopied] = useState(false);
  const bookmarkScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    isSaved(item.id).then(setSaved);
  }, [item.id]);

  function bounceBookmark() {
    bookmarkScale.setValue(1);
    Animated.sequence([
      Animated.spring(bookmarkScale, { toValue: 1.35, speed: 30, bounciness: 12, useNativeDriver: true }),
      Animated.spring(bookmarkScale, { toValue: 1, speed: 20, bounciness: 8, useNativeDriver: true }),
    ]).start();
  }

  async function toggleSave() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bounceBookmark();
    if (saved) {
      await unsaveCuriosity(item.id);
      setSaved(false);
      onSaveChange?.(false);
    } else {
      await saveCuriosity(item);
      setSaved(true);
      onSaveChange?.(true);
    }
  }

  function toggleExpand() {
    LayoutAnimation.configureNext({
      duration: 260,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
    });
    setExpanded((v) => !v);
  }

  async function handleShare(platform: SharePlatform) {
    const text = buildShareText(item);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      switch (platform) {
        case 'whatsapp': {
          const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
          const supported = await Linking.canOpenURL(url);
          if (supported) {
            await Linking.openURL(url);
          } else {
            await Share.share({ message: text });
          }
          break;
        }
        case 'twitter': {
          const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
          await Linking.openURL(url);
          break;
        }
        case 'instagram': {
          // Instagram não aceita texto pré-preenchido via URL scheme — usa o share sheet nativo.
          await Share.share({ message: text });
          break;
        }
        case 'copy': {
          await Clipboard.setStringAsync(text);
          setJustCopied(true);
          setTimeout(() => setJustCopied(false), 1800);
          break;
        }
      }
    } catch {
      // Usuário cancelou o share sheet ou o app de destino não está instalado — sem problema, ignora.
    }
  }

  const categoryLabel = CATEGORY_LABEL[item.category] ?? item.category;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{categoryLabel.toUpperCase()}</Text>
        </View>
        <TouchableOpacity onPress={toggleSave} hitSlop={12} style={styles.saveBtn}>
          <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
            <Feather
              name="bookmark"
              size={20}
              color={saved ? theme.colors.bookmarkSaved : theme.colors.bookmarkDefault}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.85}>
        <Text style={styles.hook}>{item.hook}</Text>
      </TouchableOpacity>

      <Text style={styles.body}>{item.body}</Text>

      <View style={styles.shareRow}>
        {SHARE_PLATFORMS.map((p) => {
          const isCopyPill = p.key === 'copy';
          const showCopied = isCopyPill && justCopied;
          return (
            <TouchableOpacity
              key={p.key}
              style={[styles.sharePill, showCopied && styles.sharePillActive]}
              onPress={() => handleShare(p.key)}
              activeOpacity={0.7}
            >
              <Feather
                name={showCopied ? 'check' : p.icon}
                size={12}
                color={showCopied ? theme.colors.background : theme.colors.textSecondary}
              />
              <Text style={[styles.sharePillText, showCopied && styles.sharePillTextActive]}>
                {showCopied ? 'Copied' : p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {expanded && item.deepDive && (
        <View style={styles.deepDiveContainer}>
          <View style={styles.deepDiveDivider} />
          <Text style={styles.deepDive}>{item.deepDive}</Text>
        </View>
      )}

      {item.deepDive && (
        <TouchableOpacity onPress={toggleExpand} style={styles.expandBtn} activeOpacity={0.6}>
          <Text style={styles.expandText}>
            {expanded ? 'Show less' : 'Tell me more →'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPill: {
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 3,
    borderColor: theme.colors.pillBorder,
    backgroundColor: theme.colors.pillBackground,
  },
  categoryText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.pillText,
    letterSpacing: 1,
  },
  saveBtn: {
    padding: 4,
  },
  hook: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    lineHeight: theme.typography.sizes.lg * theme.typography.lineHeights.normal,
    color: theme.colors.textPrimary,
  },
  body: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    lineHeight: theme.typography.sizes.base * theme.typography.lineHeights.relaxed,
    color: theme.colors.textSecondary,
  },
  shareRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  sharePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radius.sm,
    paddingVertical: 5,
    paddingHorizontal: theme.spacing.sm + 2,
  },
  sharePillActive: {
    backgroundColor: theme.colors.bookmarkSaved,
  },
  sharePillText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  sharePillTextActive: {
    color: theme.colors.background,
    fontWeight: theme.typography.weights.bold,
  },
  deepDiveContainer: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  deepDiveDivider: {
    height: 1,
    width: 24,
    backgroundColor: theme.colors.accent,
    opacity: 0.4,
  },
  deepDive: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    lineHeight: theme.typography.sizes.base * theme.typography.lineHeights.relaxed,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  expandBtn: {
    alignSelf: 'flex-start',
  },
  expandText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.accent,
  },
});
