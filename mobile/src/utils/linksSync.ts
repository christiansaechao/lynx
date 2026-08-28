import type { Link } from '@/types/card';
import { supabase } from '@/utils/supabase';

/**
 * Direct writes to the `links` table for back-of-card edits. Mirrors
 * onboarding.tsx's direct-insert style: the links_{insert,update,delete}_own
 * RLS policies already authorize exactly these writes via the owning card,
 * so no RPC is needed.
 *
 * Every call is best-effort and returns `{ ok }` rather than throwing --
 * the store has already updated in memory and written the local cache, so
 * a failure here (offline, RLS, transient) just means the DB catches up
 * later via AuthProvider's dirty re-push. Callers fire-and-forget.
 */
export interface SyncResult {
  ok: boolean;
}

const ok: SyncResult = { ok: true };
const failed: SyncResult = { ok: false };

/** Insert one link. `id` is the client localId so the row matches the store. */
export async function syncAddLink(
  cardId: string,
  link: Link,
  sortOrder: number,
): Promise<SyncResult> {
  try {
    const { error } = await supabase.from('links').insert({
      id: link.id,
      card_id: cardId,
      platform: link.platform,
      url: link.url,
      is_active: link.isActive,
      sort_order: sortOrder,
    });
    return error ? failed : ok;
  } catch {
    return failed;
  }
}

export async function syncUpdateLink(
  id: string,
  updates: Partial<Omit<Link, 'id'>>,
): Promise<SyncResult> {
  try {
    const { error } = await supabase
      .from('links')
      .update({
        ...(updates.platform !== undefined && { platform: updates.platform }),
        ...(updates.url !== undefined && { url: updates.url }),
        ...(updates.isActive !== undefined && { is_active: updates.isActive }),
      })
      .eq('id', id);
    return error ? failed : ok;
  } catch {
    return failed;
  }
}

export async function syncRemoveLink(id: string): Promise<SyncResult> {
  try {
    const { error } = await supabase.from('links').delete().eq('id', id);
    return error ? failed : ok;
  } catch {
    return failed;
  }
}

/** Persist the new order as `sort_order` on every row in one upsert. */
export async function syncReorderLinks(cardId: string, links: Link[]): Promise<SyncResult> {
  try {
    const { error } = await supabase.from('links').upsert(
      links.map((link, index) => ({
        id: link.id,
        card_id: cardId,
        platform: link.platform,
        url: link.url,
        is_active: link.isActive,
        sort_order: index,
      })),
    );
    return error ? failed : ok;
  } catch {
    return failed;
  }
}

/**
 * The dirty re-push: replace the card's entire link set with what the
 * client holds. Delete-all then re-insert keeps it simple and also drops
 * rows deleted offline. Used by AuthProvider when a cached card was marked
 * dirty and the network is back.
 */
export async function syncReplaceAllLinks(cardId: string, links: Link[]): Promise<SyncResult> {
  try {
    const { error: delError } = await supabase.from('links').delete().eq('card_id', cardId);
    if (delError) return failed;

    if (links.length === 0) return ok;

    const { error: insError } = await supabase.from('links').insert(
      links.map((link, index) => ({
        id: link.id,
        card_id: cardId,
        platform: link.platform,
        url: link.url,
        is_active: link.isActive,
        sort_order: index,
      })),
    );
    return insError ? failed : ok;
  } catch {
    return failed;
  }
}
