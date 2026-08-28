/**
 * Global design tokens for Lynx. These are the single source of truth for
 * the values described in docs/MOCKUP_BRIEF.md — palette, spacing, type
 * scale, card geometry, and motion. Screens should reference these rather
 * than hardcoding numbers, so the "American Psycho" restraint stays
 * consistent as more mockup screens land.
 */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * App UI palette. Strict monochrome by design: all color in the product
 * comes from the card materials, never from the interface. Dark is the
 * hero presentation.
 */
export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    /** Hairline rules under inputs and between grouped-list rows. */
    hairline: '#E0E1E6',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    hairline: '#2E3135',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/**
 * The brief's spacing scale: 2 / 4 / 8 / 16 / 24 / 32 / 64 pt, used
 * strictly — no arbitrary values. Numeric keys are the canonical names;
 * the word aliases below are kept so existing screens keep compiling.
 */
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 64,

  /** @deprecated Use the size names above. */
  half: 2,
  /** @deprecated Use the size names above. */
  one: 4,
  /** @deprecated Use the size names above. */
  two: 8,
  /** @deprecated Use the size names above. */
  three: 16,
  /** @deprecated Use the size names above. */
  four: 24,
  /** @deprecated Use the size names above. */
  five: 32,
  /** @deprecated Use the size names above. */
  six: 64,
} as const;

/**
 * App-chrome type scale. Card typography is separate and lives with the
 * card template, since it scales with the card rather than the screen.
 *
 * `label` is the small-caps treatment used throughout the UI: all-caps at
 * generous letter-spacing, per the brief's "typography is the interface".
 */
export const Typography = {
  /** The `Lynx.` wordmark. Always rendered with its trailing period. */
  wordmark: { fontSize: 40, lineHeight: 46, letterSpacing: 2, fontWeight: '400' },
  title: { fontSize: 32, lineHeight: 38, letterSpacing: 0.5, fontWeight: '600' },
  heading: { fontSize: 22, lineHeight: 28, letterSpacing: 0.25, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  /** Small-caps field labels and section headers. */
  label: { fontSize: 11, lineHeight: 14, letterSpacing: 2.5, fontWeight: '500' },
  /** Terse, declarative button text — "Mint Card", never exclamatory. */
  button: { fontSize: 15, lineHeight: 20, letterSpacing: 1, fontWeight: '500' },
  mono: { fontSize: 12, lineHeight: 18, fontWeight: '500' },
} as const;

export type TypographyVariant = keyof typeof Typography;

/** The wordmark's trailing period is part of the mark — never drop it. */
export const WORDMARK = 'Lynx.' as const;

/**
 * Card geometry. Standard business-card proportions with a tight,
 * physical die-cut radius — never a pill.
 */
export const Card = {
  /** Landscape business-card ratio, width / height. */
  aspectRatio: 1.75,
  radius: 16,
  /** Inner padding of a card face, in card-local points. */
  padding: Spacing.lg,
} as const;

/**
 * Motion. Tactile and damped, never bouncy or springy.
 */
export const Motion = {
  durations: {
    /** Micro-interactions: press states, chip selection. */
    fast: 140,
    /** Sheets gliding, cross-fades. */
    base: 260,
    /** The 3D card flip. */
    flip: 520,
    /** The "thud" — card falling out of darkness on creation. */
    thud: 700,
  },
  /** Damped spring for anything physical. Low bounce by design. */
  spring: { damping: 20, stiffness: 140, mass: 1 },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
