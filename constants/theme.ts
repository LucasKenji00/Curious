export const theme = {
  colors: {
    // Backgrounds
    background: '#0F0A1E',
    backgroundCard: '#1E1535',
    backgroundElevated: '#2A1F4A',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A89BC2',
    textMuted: '#7C6FA0',

    // Accent
    accent: '#C084FC',
    accentSoft: '#3D2265',

    // Category pills
    pillBorder: '#C084FC',
    pillText: '#C084FC',
    pillBackground: 'rgba(192, 132, 252, 0.1)',

    // UI
    border: '#2D2050',
    tabBarBackground: '#0F0A1E',
    tabBarActive: '#FFFFFF',
    tabBarInactive: '#7C6FA0',

    // Bookmark
    bookmarkDefault: '#7C6FA0',
    bookmarkSaved: '#C084FC',

    // Settings icon
    settingsIcon: '#7C6FA0',

    // Notification preview background (lock screen feel)
    notifBackground: '#1E1535',
    notifTitle: '#FFFFFF',
    notifBody: '#A89BC2',

    // Buttons
    buttonPrimary: '#C084FC',
    buttonPrimaryText: '#0F0A1E',
    buttonSecondary: '#2A1F4A',
    buttonSecondaryText: '#FFFFFF',

    // Gradient (paywall / CTA especial)
    gradientStart: '#C084FC',
    gradientEnd: '#818CF8',
  },

  typography: {
    fontFamily: 'System',
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 17,
      xl: 22,
      xxl: 28,
      hero: 34,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      bold: '700' as const,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 100,
  },
} as const;

export type Theme = typeof theme;
