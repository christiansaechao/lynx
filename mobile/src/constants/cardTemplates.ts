import type { CardFontId, CardTemplateId } from '@/types/card';

/** Pricing gate for a template. Not enforced anywhere yet -- see MONETIZATION_STRATEGY.md's "Premium Layout Templates" line; this field just makes the data ready for that gating pass. */
export type TemplateTier = 'free' | 'premium';

/**
 * Visual treatment for a card template: background, text color, and type
 * styling. Keyed by CardTemplateId so a future template fetched from the
 * user's owned templates in the database can be dropped into this same
 * shape at runtime instead of being hardcoded here.
 */
export interface CardTemplate {
  name: string;
  tier: TemplateTier;
  background: {
    colors: [string, string];
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  textColor: string;
  labelColor: string;
  fontFamily: CardFontId;
  nameLetterSpacing: number;
  labelLetterSpacing: number;
}

// Per EDITOR_SPEC.md's Layout Templates section (Classic / Creative / Dev).
// These are styling presets only, not distinct structural layouts --
// CardFront's element positions stay fixed across all three; only colors,
// fonts, and letter-spacing change. A future template that also needs a
// different arrangement of fields would require CardFront itself to branch
// per templateId, not just this table.
export const CARD_TEMPLATES: Record<CardTemplateId, CardTemplate> = {
  pierceAndPierce: {
    name: 'Pierce & Pierce',
    tier: 'free',
    background: {
      colors: ['#fbfaf5', '#e9e3d6'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    textColor: '#1c1a14',
    labelColor: '#4a463c',
    fontFamily: 'serif',
    nameLetterSpacing: 0.5,
    labelLetterSpacing: 2.5,
  },
  creative: {
    name: 'The Creative',
    tier: 'free',
    background: {
      colors: ['#fff4e8', '#ffd9c2'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    textColor: '#2b1608',
    labelColor: '#8a4a24',
    fontFamily: 'sans',
    nameLetterSpacing: 0,
    labelLetterSpacing: 1.5,
  },
  dev: {
    name: 'The Dev',
    tier: 'free',
    background: {
      colors: ['#0d1117', '#161b22'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    textColor: '#c9d1d9',
    labelColor: '#58a6ff',
    fontFamily: 'mono',
    nameLetterSpacing: 0,
    labelLetterSpacing: 1,
  },
};

export const DEFAULT_TEMPLATE_ID: CardTemplateId = 'pierceAndPierce';

export function getCardTemplate(templateId: CardTemplateId): CardTemplate {
  return CARD_TEMPLATES[templateId] ?? CARD_TEMPLATES[DEFAULT_TEMPLATE_ID];
}

export const TEMPLATE_LIST: CardTemplate[] = Object.values(CARD_TEMPLATES);
