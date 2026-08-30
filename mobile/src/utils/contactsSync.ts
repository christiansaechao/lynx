import type { ContactCard } from '@/types/card';
import { supabase } from '@/utils/supabase';

/**
 * Direct writes to the `contacts` table, mirroring linksSync.ts: best-effort,
 * fire-and-forget from the store. The full visual copy (fields/links/
 * material/style) lives client-side on ContactCard and isn't duplicated into
 * this row -- `contacts` only records the capture event and points back at
 * `source_card_id`, which is re-joined against `cards` if ever needed
 * server-side (e.g. bulk LinkedIn connect, per ROADMAP.md).
 */
export interface SyncResult {
  ok: boolean;
}

export async function syncAddContact(ownerUserId: string, contact: ContactCard): Promise<SyncResult> {
  try {
    const { error } = await supabase.from('contacts').insert({
      id: contact.id,
      owner_user_id: ownerUserId,
      source_card_id: contact.sourceCardId,
      folder_id: contact.folderId,
      starred: contact.starred,
      note: contact.note,
      collected_at: contact.collectedAt,
      sorted_at: contact.sortedAt,
      source: contact.source,
    });
    return error ? { ok: false } : { ok: true };
  } catch {
    return { ok: false };
  }
}

/**
 * Patches the mutable fields of an already-collected contact -- the manual
 * star toggle and the note editor in the Rolodex. `folder_id` is included
 * so a future "move to folder" action reuses this path; today the store
 * only ever changes `starred` / `note` post-capture.
 */
export async function syncUpdateContact(
  ownerUserId: string,
  contact: Pick<ContactCard, 'id' | 'starred' | 'note' | 'folderId' | 'sortedAt'>,
): Promise<SyncResult> {
  try {
    const { error } = await supabase
      .from('contacts')
      .update({
        starred: contact.starred,
        note: contact.note,
        folder_id: contact.folderId,
        sorted_at: contact.sortedAt,
      })
      .eq('id', contact.id)
      .eq('owner_user_id', ownerUserId);
    return error ? { ok: false } : { ok: true };
  } catch {
    return { ok: false };
  }
}
