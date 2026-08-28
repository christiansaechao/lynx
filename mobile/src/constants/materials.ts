import type { CardMaterialId } from '@/types/card';

/**
 * The materials catalog (docs/MATERIALS_CATALOG.md). Materials are the
 * product's cosmetic economy — the "flex" — so each one describes a real
 * reactive surface rather than a flat color: a base gradient, a glare
 * layer whose intensity and tint differ per finish, and how the text sits
 * on the surface (raised, pressed in, or flat).
 *
 * Rendering these is CardMaterial's job; this file only declares them so
 * the swatch grid, the store, and the card face all read the same source.
 */

/** How the ink sits on the surface, which drives the text shadow. */
export type InkRelief = 'embossed' | 'debossed' | 'flat';

export type MaterialTier = 'free' | 'premium';

export interface CardMaterial {
  id: CardMaterialId;
  name: string;
  /** Grouping shown in the store and the swatch grid. */
  collection: 'Classics' | 'Modern Executives' | 'Creatives & Techies' | 'Avant-Garde';
  tier: MaterialTier;
  /** Diagonal base gradient, top-left to bottom-right. */
  background: {
    colors: [string, string];
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  /** Primary ink — the name. */
  textColor: string;
  /** Secondary ink — labels, title, contact line. */
  labelColor: string;
  relief: InkRelief;
  glare: {
    /** Tint of the moving highlight. */
    color: string;
    /** Opacity at rest, before tilt is applied. */
    restOpacity: number;
    /** Additional opacity at full tilt. Metals and gloss peak higher. */
    tiltOpacity: number;
  };
  /** Translucent finishes blur whatever sits behind the card. */
  translucent?: boolean;
}

const DIAGONAL = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } } as const;

export const CARD_MATERIALS: Record<CardMaterialId, CardMaterial> = {
  bone: {
    id: 'bone',
    name: 'Bone',
    collection: 'Classics',
    tier: 'free',
    background: { colors: ['#fbfaf5', '#e9e3d6'], ...DIAGONAL },
    textColor: '#1c1a14',
    labelColor: '#4a463c',
    relief: 'embossed',
    glare: { color: '#ffffff', restOpacity: 0.1, tiltOpacity: 0.25 },
  },
  silianRail: {
    id: 'silianRail',
    name: 'Silian Rail',
    collection: 'Classics',
    tier: 'free',
    background: { colors: ['#ffffff', '#f4f4f2'], ...DIAGONAL },
    textColor: '#111111',
    labelColor: '#4a4a4a',
    relief: 'embossed',
    glare: { color: '#ffffff', restOpacity: 0.08, tiltOpacity: 0.2 },
  },
  // The remaining eight, per MATERIALS_CATALOG.md. Pricing gating isn't
  // enforced anywhere yet -- `tier` just makes the data ready for that pass.
  obsidianMatte: {
    id: 'obsidianMatte',
    name: 'Obsidian Matte',
    collection: 'Modern Executives',
    tier: 'premium',
    background: { colors: ['#0e0e10', '#050506'], ...DIAGONAL },
    textColor: '#1a1a1d',
    labelColor: '#2a2a2d',
    // Debossed gloss-black text that only reveals itself on tilt -- see
    // MATERIALS_CATALOG.md's Obsidian Matte entry.
    relief: 'debossed',
    glare: { color: '#8a8a95', restOpacity: 0.04, tiltOpacity: 0.35 },
  },
  brushedGunmetal: {
    id: 'brushedGunmetal',
    name: 'Brushed Gunmetal',
    collection: 'Modern Executives',
    tier: 'premium',
    background: { colors: ['#3a3d42', '#24262a'], ...DIAGONAL },
    textColor: '#f2f2f2',
    labelColor: '#c4c6ca',
    relief: 'flat',
    glare: { color: '#e8eaee', restOpacity: 0.12, tiltOpacity: 0.4 },
  },
  anodizedTitanium: {
    id: 'anodizedTitanium',
    name: 'Anodized Titanium',
    collection: 'Modern Executives',
    tier: 'premium',
    background: { colors: ['#8e9296', '#6b6e72'], ...DIAGONAL },
    textColor: '#0e0e0f',
    labelColor: '#2c2d2f',
    relief: 'flat',
    glare: { color: '#ffffff', restOpacity: 0.1, tiltOpacity: 0.3 },
  },
  frostedGlass: {
    id: 'frostedGlass',
    name: 'Frosted Glass',
    collection: 'Creatives & Techies',
    tier: 'premium',
    background: { colors: ['#e8f0f5', '#d5e2ea'], ...DIAGONAL },
    textColor: '#1c2833',
    labelColor: '#4a5a68',
    relief: 'flat',
    glare: { color: '#ffffff', restOpacity: 0.2, tiltOpacity: 0.3 },
    translucent: true,
  },
  holographicPrism: {
    id: 'holographicPrism',
    name: 'Holographic Prism',
    collection: 'Creatives & Techies',
    tier: 'premium',
    background: { colors: ['#e0d4f7', '#c9e8f0'], ...DIAGONAL },
    textColor: '#14141e',
    labelColor: '#4d4a5c',
    relief: 'flat',
    // Iridescent shifting glare is the whole point of this finish -- the
    // rest color/opacity here just seed CardMaterial; the shimmer itself
    // is CardMaterial's job to render (see CARD_MATERIALS_IMPLEMENTATION.md).
    glare: { color: '#b98ce0', restOpacity: 0.18, tiltOpacity: 0.45 },
  },
  carbonFiber: {
    id: 'carbonFiber',
    name: 'Carbon Fiber Weave',
    collection: 'Creatives & Techies',
    tier: 'premium',
    background: { colors: ['#16171a', '#08090a'], ...DIAGONAL },
    textColor: '#e8e8ea',
    labelColor: '#9a9a9e',
    relief: 'flat',
    glare: { color: '#5a6a7a', restOpacity: 0.1, tiltOpacity: 0.35 },
  },
  rawConcrete: {
    id: 'rawConcrete',
    name: 'Raw Concrete',
    collection: 'Avant-Garde',
    tier: 'premium',
    background: { colors: ['#c7c4bd', '#aaa7a0'], ...DIAGONAL },
    textColor: '#3a3835',
    labelColor: '#5c5a56',
    relief: 'flat',
    glare: { color: '#ffffff', restOpacity: 0.05, tiltOpacity: 0.12 },
  },
  roseGoldFoil: {
    id: 'roseGoldFoil',
    name: 'Rose Gold Foil',
    collection: 'Avant-Garde',
    tier: 'premium',
    background: { colors: ['#f0c8bc', '#d9a08e'], ...DIAGONAL },
    textColor: '#3a1f18',
    labelColor: '#6b3d30',
    relief: 'embossed',
    glare: { color: '#fff0e0', restOpacity: 0.2, tiltOpacity: 0.5 },
  },
};

export const DEFAULT_MATERIAL_ID: CardMaterialId = 'bone';

export function getCardMaterial(materialId: CardMaterialId): CardMaterial {
  return CARD_MATERIALS[materialId] ?? CARD_MATERIALS[DEFAULT_MATERIAL_ID];
}

export const MATERIAL_LIST: CardMaterial[] = Object.values(CARD_MATERIALS);
