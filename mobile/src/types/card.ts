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
  /**
   * A custom `#rrggbb` ink chosen from the colour picker. Mutually
   * exclusive with `fontColorId` -- setting one clears the other. When set
   * it wins over both the preset and the material's own ink; the label
   * colour is derived from it (see utils/color.ts).
   */
  fontColorHex?: string;
  /** Per-field style overrides, keyed by EditableFieldKey. Absent = template defaults, no overrides. */
  fieldStyles: Partial<Record<EditableFieldKey, FieldStyle>>;
}

/** An event folder a collected card can be filed into (docs/PRODUCT_REQUIREMENTS.md's Active Folders). */
export interface RolodexFolder {
  id: string;
  name: string;
  /** Newly collected cards auto-route into whichever folder has this set. At most one folder is active at a time. */
  isActive: boolean;
}

/**
 * A point-in-time copy of someone else's card, saved into the collecting
 * user's Rolodex. Deliberately not a live reference to the original card:
 * the PRD calls for cards "saved here in its original, high-fidelity
 * format" — if the other person edits their card later, this entry stays
 * as it was at the moment of collection.
 */
export interface ContactCard {
  id: string;
  /**
   * The originating cards.id this copy was captured from. Nullable for the
   * seeded mock data (which has no backing row); a real capture always sets
   * it -- it's what the future Post-Meetup Sorting screen matches on to
   * detect and merge repeat encounters of the same person.
   */
  sourceCardId: string | null;
  fields: CardFields;
  links: Link[];
  materialId: CardMaterialId;
  templateId: CardTemplateId;
  fontId?: CardFontId;
  fontColorId?: CardFontColorId;
  fontColorHex?: string;
  /** ISO 8601. When this card was collected. */
  collectedAt: string;
  /** Which RolodexFolder this was auto-routed into, if any was active at collection time. */
  folderId: string | null;
  /** Free-text note the collecting user attached, per the Personal CRM feature. */
  note: string | null;
  /** Swiped right in post-meetup sorting, or starred manually — a prioritized/VIP flag. */
  starred: boolean;
  /** How this card was collected. */
  source: 'qr' | 'nfc';
}
