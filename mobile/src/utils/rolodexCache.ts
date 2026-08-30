import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ContactCard, RolodexFolder } from '@/types/card';

/**
 * Local mirror of the Rolodex, same pattern as cardCache.ts: instant local
 * reads/writes are the primary path (offline-first), Supabase is synced to
 * in the background. Keyed per user id so a second account on the same
 * device never inherits the first user's contacts.
 */
const KEY_PREFIX = 'lynx.rolodex.';

interface CachedRolodex {
  contacts: ContactCard[];
  folders: RolodexFolder[];
  savedAt: number;
}

const keyFor = (userId: string) => `${KEY_PREFIX}${userId}`;

/** Best-effort: a storage failure must never break a capture or a launch. */
export async function saveRolodexCache(
  userId: string,
  entry: { contacts: ContactCard[]; folders: RolodexFolder[] },
): Promise<void> {
  try {
    const payload: CachedRolodex = { ...entry, savedAt: Date.now() };
    await AsyncStorage.setItem(keyFor(userId), JSON.stringify(payload));
  } catch {
    // The DB write (when online) is the real persistence; this is a backup.
  }
}

export async function loadRolodexCache(userId: string): Promise<CachedRolodex | null> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRolodex;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.contacts)) return null;
    return parsed;
  } catch {
    return null;
  }
}
