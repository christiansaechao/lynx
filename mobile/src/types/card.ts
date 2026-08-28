/**
 * Mirrors shared/types/database.ts. No monorepo package linking exists yet
 * (mobile and web are separate TS projects with no shared build), so this
 * is a manual copy — keep both in sync until that wiring is set up.
 */

export type CardContext = 'employed' | 'jobSeeker';

export interface EmployedCardFields {
  context: 'employed';
  companyName: string;
  fullName: string;
  jobTitle: string;
  department: string;
  location: string;
  phone: string;
  email: string;
}

export interface JobSeekerCardFields {
  context: 'jobSeeker';
  headline: string;
  fullName: string;
  targetRole: string;
  education: string;
  location: string;
  phone: string;
  email: string;
}

export type CardFields = EmployedCardFields | JobSeekerCardFields;

export type EditableFieldKey = Exclude<keyof EmployedCardFields | keyof JobSeekerCardFields, 'context'>;

export interface Link {
  id: string;
  platform: string;
  url: string;
  isActive: boolean;
}

export type CardMaterialId =
  | 'bone'
  | 'silianRail'
  | 'obsidianMatte'
  | 'brushedGunmetal'
  | 'anodizedTitanium'
  | 'frostedGlass'
  | 'holographicPrism'
  | 'carbonFiber'
  | 'rawConcrete'
  | 'roseGoldFoil';

/** Which of theme.ts's Fonts entries a card uses for its type. */
export type CardFontId = 'serif' | 'sans' | 'mono' | 'rounded';

/** A selectable ink color for the card's text, independent of material/template. */
export type CardFontColorId = 'ink' | 'charcoal' | 'midnight' | 'burgundy' | 'forest' | 'bronze';

/**
 * Element-specific style overrides for one field, per EDITOR_SPEC.md's
 * "Element-Specific Settings". Applied on top of the template's base
 * styling (see CARD_TEMPLATES) rather than replacing it -- kerning is
 * additive to the template's letterSpacing, not a replacement value.
 */
export interface FieldStyle {
  bold?: boolean;
  italic?: boolean;
  allCaps?: boolean;
  /** Additive to the template's base letter-spacing. Roughly -1 to 4. */
  kerning?: number;
  /**
   * Hidden fields are skipped entirely when rendering the shared/view-only
   * card, but stay visible at reduced opacity in the editor so they can be
   * found and re-enabled -- same pattern as CardBack's inactive links.
   */
  hidden?: boolean;
}

/**
 * Identifies a visual template loaded from the templates a user owns.
 * Local ids (like 'pierceAndPierce') ship with the app; a future backend
 * template will use its database id here instead.
 */
export type CardTemplateId = string;

export interface Card {
  fields: CardFields;
  links: Link[];
  materialId: CardMaterialId;
  templateId: CardTemplateId;
  /** Overrides the template's default fontFamily when set. */
  fontId?: CardFontId;
  /** Overrides the template's default textColor/labelColor when set. */
  fontColorId?: CardFontColorId;
  /** Per-field style overrides, keyed by EditableFieldKey. Absent = template defaults, no overrides. */
  fieldStyles: Partial<Record<EditableFieldKey, FieldStyle>>;
}
