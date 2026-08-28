import type { CardFontId } from '@/types/card';

/**
 * The Fonts axis -- independent of Templates and Materials. A card's
 * fontId, when set, overrides its template's default fontFamily (see
 * cardTemplates.ts). Keyed off theme.ts's Fonts map so there's one source
 * of truth for the actual platform font strings.
 */
export type FontTier = 'free' | 'premium';

export interface CardFont {
  id: CardFontId;
  name: string;
  tier: FontTier;
  /** Short line rendered in the font itself, for the picker swatch. */
  preview: string;
}

// Pricing gating isn't enforced anywhere yet -- `tier` just makes the data
// ready for that pass, per the same MONETIZATION_STRATEGY.md line that
// covers Templates.
export const CARD_FONTS: Record<CardFontId, CardFont> = {
  serif: {
    id: 'serif',
    name: 'Serif',
    tier: 'free',
    preview: 'Aa',
  },
  sans: {
    id: 'sans',
    name: 'Sans',
    tier: 'free',
    preview: 'Aa',
  },
  mono: {
    id: 'mono',
    name: 'Mono',
    tier: 'premium',
    preview: 'Aa',
  },
  rounded: {
    id: 'rounded',
    name: 'Rounded',
    tier: 'premium',
    preview: 'Aa',
  },
};

export const DEFAULT_FONT_ID: CardFontId = 'serif';

export function getCardFont(fontId: CardFontId): CardFont {
  return CARD_FONTS[fontId] ?? CARD_FONTS[DEFAULT_FONT_ID];
}

export const FONT_LIST: CardFont[] = Object.values(CARD_FONTS);
