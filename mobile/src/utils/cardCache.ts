import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Card } from '@/types/card';

/**
 * A local mirror of the user's card, so a relaunch with no network still
 * shows their real content instead of the seeded mockup. The backend is
 * the source of truth when reachable (see AuthProvider): this cache is
 * read only when the fetch fails, and rewritten on every successful fetch
 * and every local edit.
 *
 * Keyed per user id so a second account signing in on the same device
 * never inherits the first user's card.
 */
const KEY_PREFIX = 'lynx.card.';

interface CachedCard {
  /** The card row id, needed to target link writes after an offline load. */
  cardId: string | null;
  card: Card;
  /** Last known Master QR image URL, so an offline launch still renders the QR. */
  snapshotUrl?: string | null;
  /**
   * Set when the card was edited offline and the DB has not caught up.
   * AuthProvider re-pushes on the next foreground-with-network, then clears it.
   */
  dirty: boolean;
  /** ms epoch of the last write to this cache, for debugging / future LWW. */
  savedAt: number;
}

const keyFor = (userId: string) => `${KEY_PREFIX}${userId}`;

/** Best-effort: a storage failure must never break an edit or a launch. */
export async function saveCardCache(
  userId: string,
  entry: { cardId: string | null; card: Card; dirty: boolean; snapshotUrl?: string | null },
): Promise<void> {
  try {
    const payload: CachedCard = { ...entry, savedAt: Date.now() };
    await AsyncStorage.setItem(keyFor(userId), JSON.stringify(payload));
  } catch {
    // The DB write (when online) is the real persistence; this is a backup.
  }
}

export async function loadCardCache(userId: string): Promise<CachedCard | null> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedCard;
    if (!parsed || typeof parsed !== 'object' || !parsed.card) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Read-modify-write of just the snapshot URL, leaving `card` and the
 * `dirty` flag untouched -- the Master QR image updating must not disturb
 * an offline link edit still waiting to be re-pushed.
 */
export async function updateCachedSnapshotUrl(
  userId: string,
  snapshotUrl: string | null,
): Promise<void> {
  try {
    const existing = await loadCardCache(userId);
    if (!existing) return;
    const payload: CachedCard = { ...existing, snapshotUrl, savedAt: Date.now() };
    await AsyncStorage.setItem(keyFor(userId), JSON.stringify(payload));
  } catch {
    // The URL is also on cards.master_qr_asset_url; cache is a convenience.
  }
}

export async function clearCardCache(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(keyFor(userId));
  } catch {
    // Nothing to recover -- a stale entry is overwritten on the next save.
  }
}
