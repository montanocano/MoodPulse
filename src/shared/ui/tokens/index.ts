import { createTokens } from "@tamagui/core";

export const tokens = createTokens({
  color: {
    // Brand
    primary: "#7A8B36",
    secondary: "#A0B84A",

    // Emotion palette
    emotionHappy: "#F5C518",
    emotionSad: "#4A90D9",
    emotionAnxious: "#FF6B6B",
    emotionAngry: "#E74C3C",
    emotionNeutral: "#95A5A6",
    emotionGrateful: "#2ECC71",
    emotionTired: "#8E44AD",
    emotionMotivated: "#F39C12",

    // Semantic – light defaults (overridden by themes)
    backgroundLight: "#F2EDD5",
    backgroundDark: "#1A1D0A",
    surfaceLight: "#FEFEF5",
    surfaceDark: "#252A10",
    textLight: "#2C2E18",
    textDark: "#F0EDD5",

    // Error / neutral
    error: "#E74C3C",
    white: "#FFFFFF",
    black: "#000000",
    muted: "#E0E0E0",
    transparent: "transparent",
  },

  space: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    // Required size tokens
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    true: 16,
  },

  size: {
    xs: 28,
    sm: 36,
    md: 44,
    lg: 52,
    xl: 60,
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    true: 44,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    true: 12,
  },

  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
});
