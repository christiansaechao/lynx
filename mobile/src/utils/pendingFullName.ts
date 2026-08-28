import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Apple returns the user's real name only on the *first* authorization for an
 * app. Every later sign-in returns null name parts, and the only way to make
 * Apple send it again is for the user to revoke the app in
 * Settings -> Apple ID -> Sign in with Apple and re-authorize.
 *
 * So the name has to be captured at sign-in and held until onboarding can use
 * it, which is a different screen across an app-state transition. AsyncStorage
 * rather than auth user_metadata: writing metadata means an updateUser() call
 * right after sign-in, which is the async-Supabase-call-during-auth shape that
 * deadlocks the client (see the note in AuthProvider).
 */
const KEY = 'lynx.pendingFullName';

/**
 * Joins Apple's name parts. Returns null when Apple gave us nothing usable,
 * which is the normal case on every sign-in after the first.
 */
export function formatAppleName(
  fullName: { givenName?: string | null; familyName?: string | null } | null,
): string | null {
  if (!fullName) return null;

  const joined = [fullName.givenName, fullName.familyName]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(' ')
    .trim();

  return joined || null;
}

/** Best-effort: a storage failure must never break an otherwise good sign-in. */
export async function savePendingFullName(name: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, name);
  } catch {
    // Prefill is a convenience; the user can still type their name.
  }
}

/**
 * Reads and clears in one step. Clearing on read is what keeps a different
 * user signing in on the same device from inheriting the previous user's name.
 */
export async function consumePendingFullName(): Promise<string | null> {
  try {
    const stored = await AsyncStorage.getItem(KEY);
    if (stored) await AsyncStorage.removeItem(KEY);
    return stored;
  } catch {
    return null;
  }
}
