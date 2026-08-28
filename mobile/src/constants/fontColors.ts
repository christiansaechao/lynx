import type { CardFontColorId } from '@/types/card';

/**
 * The Font Color axis -- independent of Templates and Materials. A card's
 * fontColorId, when set, overrides its template's default textColor and
 * labelColor (see cardTemplates.ts). labelColor is derived by lightening
 * textColor's role slightly, matching how each template already pairs a
 * primary ink with a softer secondary ink for labels.
 */
export type FontColorTier = 'free' | 'premium';

export interface CardFontColor {
  id: CardFontColorId;
  name: string;
  tier: FontColorTier;
  textColor: string;
  labelColor: string;
}

// Pricing gating isn't enforced anywhere yet -- `tier` just makes the data
// ready for that pass, per the same MONETIZATION_STRATEGY.md line that
// covers Templates.
export const CARD_FONT_COLORS: Record<CardFontColorId, CardFontColor> = {
  ink: {
    id: 'ink',
    name: 'Ink',
    tier: 'free',
    textColor: '#1c1a14',
    labelColor: '#4a463c',
  },
  charcoal: {
    id: 'charcoal',
    name: 'Charcoal',
    tier: 'free',
    textColor: '#2a2a2a',
    labelColor: '#5a5a5a',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    tier: 'premium',
    textColor: '#0f1a2e',
    labelColor: '#3a4a63',
  },
  burgundy: {
    id: 'burgundy',
    name: 'Burgundy',
    tier: 'premium',
    textColor: '#3d1420',
    labelColor: '#6b3444',
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    tier: 'premium',
    textColor: '#132a1c',
    labelColor: '#3a5745',
  },
  bronze: {
    id: 'bronze',
    name: 'Bronze',
    tier: 'premium',
    textColor: '#3a2712',
    labelColor: '#6b4f2a',
  },
};

export const DEFAULT_FONT_COLOR_ID: CardFontColorId = 'ink';

export function getCardFontColor(fontColorId: CardFontColorId): CardFontColor {
  return CARD_FONT_COLORS[fontColorId] ?? CARD_FONT_COLORS[DEFAULT_FONT_COLOR_ID];
}

export const FONT_COLOR_LIST: CardFontColor[] = Object.values(CARD_FONT_COLORS);
