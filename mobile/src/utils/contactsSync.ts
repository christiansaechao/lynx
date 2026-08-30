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
      source: contact.source,
    });
    return error ? { ok: false } : { ok: true };
  } catch {
    return { ok: false };
  }
}
