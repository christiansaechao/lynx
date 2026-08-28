/**
 * A client-only identifier for list items that live in the store before
 * they reach the backend (back-of-card links, and anything similar).
 *
 * `crypto.randomUUID()` is not an option: Hermes has no global `crypto`,
 * so it throws at runtime. These ids never persist as-is either -- the
 * backend assigns its own `gen_random_uuid()` on sync -- so they only need
 * to be unique within one session's array, which a timestamp plus a random
 * tail comfortably covers without pulling in a native module.
 */
export function localId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
