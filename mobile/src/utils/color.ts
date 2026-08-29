/**
 * Small hex-colour helpers for the custom Font Color picker. Opacity is
 * out of scope for now -- inputs are treated as opaque #RGB / #RRGGBB and
 * an alpha channel, if pasted, is dropped.
 */

/**
 * Validate and canonicalise a user-typed hex string to `#rrggbb` lower
 * case. Accepts an optional leading `#`, 3- or 6-digit forms, and any
 * case; `#rgba` / `#rrggbbaa` are accepted but their alpha is discarded.
 * Returns null for anything else so callers can reject it.
 */
export function normalizeHex(input: string): string | null {
  const trimmed = input.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]+$/.test(trimmed)) return null;

  let rgb: string;
  switch (trimmed.length) {
    case 3:
    case 4: // #rgba -- drop the 4th nibble
      rgb = trimmed
        .slice(0, 3)
        .split('')
        .map((c) => c + c)
        .join('');
      break;
    case 6:
    case 8: // #rrggbbaa -- drop the trailing byte
      rgb = trimmed.slice(0, 6);
      break;
    default:
      return null;
  }
  return `#${rgb.toLowerCase()}`;
}

/**
 * Derive the softer secondary ink (labels, title, contact line) from a
 * primary ink hex, mirroring how every preset in fontColors.ts pairs a
 * dark textColor with a lifted labelColor. We blend the primary ~35%
 * toward a neutral mid-grey -- enough to read as "the same colour, one
 * step back" without a separate picker.
 *
 * `hex` must already be normalised (`#rrggbb`).
 */
export function deriveLabelColor(hex: string): string {
  const MIX = 0.35;
  const TARGET = 0x8c; // mid grey, matches the presets' label lift

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const lift = (channel: number) => Math.round(channel + (TARGET - channel) * MIX);

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(lift(r))}${toHex(lift(g))}${toHex(lift(b))}`;
}
