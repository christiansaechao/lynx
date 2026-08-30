/**
 * A client-generated identifier for rows that are created in the store
 * before (or without) a round-trip to the backend -- back-of-card links,
 * and anything similar.
 *
 * This MUST be a syntactically valid UUID: the `links.id` column (and its
 * siblings) is Postgres `uuid`, and the sync helpers write this value
 * straight into it (`insert({ id })`, `update().eq('id', ...)`,
 * `upsert(...)`). A non-UUID string there fails the insert with
 * `invalid input syntax for type uuid`, which the fire-and-forget callers
 * silently swallow -- the row then only ever lives in memory.
 *
 * `crypto.randomUUID()` is not an option: Hermes has no global `crypto`,
 * so it throws at runtime. We build a RFC-4122 v4 UUID from `Math.random()`
 * instead -- not cryptographically strong, but these ids only need to not
 * collide within a user's own card, which random 122 bits comfortably
 * covers.
 */
export function localId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
