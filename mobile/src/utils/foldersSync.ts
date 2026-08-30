import type { RolodexFolder } from '@/types/card';
import { supabase } from '@/utils/supabase';

/**
 * Direct writes to the `folders` table, mirroring contactsSync.ts /
 * linksSync.ts: best-effort, fire-and-forget from the store.
 *
 * `folders.id` is Postgres `uuid`, so the store must generate the id with
 * localId() before calling this -- a non-UUID string fails the insert with
 * `invalid input syntax for type uuid`, silently swallowed here.
 *
 * The DB has a partial unique index (`folders_one_active_per_owner_idx`)
 * allowing at most one active folder per owner. The store already clears
 * every other folder's `isActive` in the same tick, so we push the whole
 * folder set on an activation change and let the last write win; if the
 * clear-then-set ordering ever races the index server-side, the local
 * state stays correct and the next mutation reconciles it.
 */
export interface SyncResult {
  ok: boolean;
}

export async function syncAddFolder(
  ownerUserId: string,
  folder: RolodexFolder,
): Promise<SyncResult> {
  try {
    const { error } = await supabase.from('folders').insert({
      id: folder.id,
      owner_user_id: ownerUserId,
      name: folder.name,
      is_active: folder.isActive,
    });
    return error ? { ok: false } : { ok: true };
  } catch {
    return { ok: false };
  }
}

/**
 * Reconciles every folder's `is_active` for one owner after an activation
 * change. Done as two ordered writes (clear all, then set the one) so the
 * partial unique index is never transiently violated.
 */
export async function syncActiveFolder(
  ownerUserId: string,
  activeFolderId: string | null,
): Promise<SyncResult> {
  try {
    const clear = await supabase
      .from('folders')
      .update({ is_active: false })
      .eq('owner_user_id', ownerUserId)
      .eq('is_active', true);
    if (clear.error) return { ok: false };

    if (activeFolderId) {
      const set = await supabase
        .from('folders')
        .update({ is_active: true })
        .eq('id', activeFolderId);
      if (set.error) return { ok: false };
    }
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
