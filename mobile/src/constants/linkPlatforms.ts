/**
 * The one place that knows what a "platform" is: its display label, the
 * fixed URL prefix a user's handle hangs off of, the slug placeholder, and
 * the App Grid glyph (docs/MOCKUP_BRIEF.md §7.5).
 *
 * `Link.platform` stays free text — the "Other" case, and links added
 * before this table existed, can be anything. So there are two tiers:
 *
 *   1. STANDARD_PLATFORMS — the dropdown in the add-link flow. Each has a
 *      canonical prefix so the user only types the slug after it.
 *   2. SYMBOLS — a wider glyph lookup for any free-typed platform name
 *      (gitlab, dribbble, medium…) so the grid still resolves an icon.
 *
 * Deliberately no brand colors: the brief calls for strict monochrome,
 * with all color coming from the card material underneath.
 */

export interface PlatformSpec {
  /** Stored verbatim as `Link.platform`. */
  id: string;
  /** Dropdown display + grid lettermark source. */
  label: string;
  /**
   * The grey, non-editable affix shown before the slug field, and the
   * string the stored URL is built from. `null` means the user types a
   * whole URL (Portfolio, Other).
   */
  prefix: string | null;
  /** Slug hint shown in the input while empty. */
  placeholder: string;
  /** SF Symbol name (iOS only); `null` falls back to the lettermark. */
  symbol: string | null;
  keyboard: 'default' | 'url';
}

/**
 * The add-link dropdown, in display order. `other` is the catch-all and is
 * always last — its lack of a prefix and generic glyph are the signal that
 * the user is off the beaten path.
 */
export const STANDARD_PLATFORMS: PlatformSpec[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    prefix: 'https://linkedin.com/in/',
    placeholder: 'your-name',
    symbol: 'briefcase',
    keyboard: 'default',
  },
  {
    id: 'github',
    label: 'GitHub',
    prefix: 'https://github.com/',
    placeholder: 'username',
    symbol: 'chevron.left.forwardslash.chevron.right',
    keyboard: 'default',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    prefix: 'https://youtube.com/@',
    placeholder: 'handle',
    symbol: 'play.rectangle',
    keyboard: 'default',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    prefix: 'https://instagram.com/',
    placeholder: 'username',
    symbol: 'camera',
    keyboard: 'default',
  },
  {
    id: 'x',
    label: 'X',
    prefix: 'https://x.com/',
    placeholder: 'username',
    symbol: 'at',
    keyboard: 'default',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    prefix: null,
    placeholder: 'yoursite.com',
    symbol: 'square.grid.2x2',
    keyboard: 'url',
  },
  {
    id: 'other',
    label: 'Other',
    prefix: null,
    placeholder: 'https://…',
    symbol: 'link',
    keyboard: 'url',
  },
];

const STANDARD_BY_ID: Record<string, PlatformSpec> = Object.fromEntries(
  STANDARD_PLATFORMS.map((spec) => [spec.id, spec]),
);

/** The `other` spec, used as the fallback for any unknown platform id. */
export const OTHER_PLATFORM = STANDARD_BY_ID.other;

/**
 * The spec for a platform id. Unknown ids (free-typed, or "Other") resolve
 * to a synthetic spec that keeps the id/label but carries no prefix.
 */
export function getPlatform(id: string): PlatformSpec {
  const key = id.trim().toLowerCase();
  const known = STANDARD_BY_ID[key];
  if (known) return known;
  return {
    ...OTHER_PLATFORM,
    id: id.trim(),
    label: id.trim() || OTHER_PLATFORM.label,
    symbol: platformSymbol(id) ?? OTHER_PLATFORM.symbol,
  };
}

/**
 * Everything a slug field would prepend or a paste might carry: the
 * platform's own prefix, the scheme, `www.`, a leading `@`, and any
 * trailing slash. Stripped so a pasted full URL collapses back to the bare
 * handle the field expects.
 */
export function stripPrefix(id: string, input: string): string {
  let value = input.trim();
  const { prefix } = getPlatform(id);

  const candidates = [
    prefix,
    prefix?.replace(/^https:\/\//, 'http://'),
    prefix?.replace(/^https:\/\//, 'https://www.'),
    prefix?.replace(/^https:\/\//, ''),
    prefix?.replace(/^https:\/\//, 'www.'),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (value.toLowerCase().startsWith(candidate.toLowerCase())) {
      value = value.slice(candidate.length);
      break;
    }
  }

  return value.replace(/^@+/, '').replace(/\/+$/, '');
}

/**
 * Build the canonical URL stored on the link. Prefixed platforms get
 * `prefix + slug`; prefix-less ones (Portfolio, Other) get the raw value,
 * with `https://` filled in when the user omitted a scheme.
 */
export function buildUrl(id: string, slug: string): string {
  const { prefix } = getPlatform(id);
  const tail = stripPrefix(id, slug);
  if (prefix) return prefix + tail;
  if (!tail) return '';
  return /^https?:\/\//i.test(tail) ? tail : `https://${tail}`;
}

/**
 * Reverse of buildUrl: given a stored URL, find which standard platform it
 * belongs to and the slug that follows the prefix — so an existing link
 * loads back into the dropdown + slug field it was created with.
 */
export function parseUrl(url: string): { id: string; slug: string } {
  const value = url.trim();
  for (const spec of STANDARD_PLATFORMS) {
    if (!spec.prefix) continue;
    const bare = spec.prefix.replace(/^https:\/\//, '');
    const withWww = `www.${bare}`;
    const match = [spec.prefix, `http://${bare}`, `https://${withWww}`, bare, withWww].find((p) =>
      value.toLowerCase().startsWith(p.toLowerCase()),
    );
    if (match) return { id: spec.id, slug: value.slice(match.length).replace(/\/+$/, '') };
  }
  return { id: 'other', slug: value };
}

/** SF Symbol names for free-typed platforms, keyed by normalised name. */
const SYMBOLS: Record<string, string> = {
  linkedin: 'briefcase',
  github: 'chevron.left.forwardslash.chevron.right',
  gitlab: 'chevron.left.forwardslash.chevron.right',
  portfolio: 'square.grid.2x2',
  'personal portfolio': 'square.grid.2x2',
  website: 'globe',
  'personal website': 'globe',
  'live demo': 'play.rectangle',
  demo: 'play.rectangle',
  dribbble: 'basketball',
  behance: 'paintpalette',
  figma: 'pencil.and.outline',
  medium: 'text.alignleft',
  substack: 'text.alignleft',
  blog: 'text.alignleft',
  x: 'at',
  twitter: 'at',
  bluesky: 'at',
  mastodon: 'at',
  instagram: 'camera',
  youtube: 'play.rectangle',
  twitch: 'play.rectangle',
  spotify: 'music.note',
  soundcloud: 'music.note',
  calendly: 'calendar',
  email: 'envelope',
  mail: 'envelope',
  phone: 'phone',
  resume: 'doc.text',
  cv: 'doc.text',
  scholar: 'graduationcap',
  'google scholar': 'graduationcap',
  orcid: 'graduationcap',
  stackoverflow: 'square.stack',
  'stack overflow': 'square.stack',
  notion: 'note.text',
  discord: 'bubble.left.and.bubble.right',
  telegram: 'paperplane',
  whatsapp: 'bubble.left',
  other: 'link',
};

/**
 * The lettermark shown when a platform has no mapped symbol. Uses the first
 * character of each of the first two words ("Live Demo" -> "LD"), so
 * unmapped platforms still read as deliberate rather than broken.
 */
export function platformLettermark(platform: string): string {
  const words = platform.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function platformSymbol(platform: string): string | null {
  return SYMBOLS[platform.trim().toLowerCase()] ?? null;
}
