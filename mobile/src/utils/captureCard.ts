import { localId } from '@/utils/localId';
import { mapCardRow } from '@/utils/mapCardRow';
import { supabase } from '@/utils/supabase';
import type { ContactCard } from '@/types/card';

/**
 * Extracts a card id out of a scanned/tapped payload. Handles both shapes
 * capture can see:
 *  - the Master QR's snapshot image URL (`.../card-snapshots/<id>.png`) --
 *    the id doubles as the storage object's filename, so no second QR or
 *    payload format is needed for in-app scanning (see cardSnapshot.ts).
 *  - an NFC `lynx://card/<id>` deep link.
 * Returns null for anything else (a stray QR code, a malformed tag).
 */
export function resolveCardId(raw: string): string | null {
  const nfcMatch = raw.match(/^lynx:\/\/card\/([0-9a-f-]{36})$/i);
  if (nfcMatch) return nfcMatch[1];

  const snapshotMatch = raw.match(/\/card-snapshots\/([0-9a-f-]{36})\.png(?:\?.*)?$/i);
  if (snapshotMatch) return snapshotMatch[1];

  return null;
}

export type CaptureError = 'not_found' | 'self' | 'network';

export interface CaptureResult {
  ok: boolean;
  contact?: ContactCard;
  error?: CaptureError;
}

/**
 * Fetches the live card (+ links) behind a resolved id and builds a fresh
 * ContactCard snapshot of it, per ContactCard's own doc: a point-in-time
 * copy, not a live reference. Always builds a new entry -- merging repeat
 * encounters of the same source card is the Post-Meetup Sorting screen's
 * job (docs/ROLODEX_EXPERIENCE.md §2), not capture time.
 */
export async function captureCardById(
  cardId: string,
  ownCardId: string | null,
  source: 'qr' | 'nfc',
  activeFolderId: string | null,
): Promise<CaptureResult> {
  if (cardId === ownCardId) return { ok: false, error: 'self' };

  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*, links(*)')
      .eq('id', cardId)
      .maybeSingle();

    if (error) return { ok: false, error: 'network' };
    if (!data) return { ok: false, error: 'not_found' };

    const { links, ...row } = data;
    const card = mapCardRow(row, links);

    const contact: ContactCard = {
      id: localId(),
      sourceCardId: row.id,
      fields: card.fields,
      links: card.links,
      materialId: card.materialId,
      templateId: card.templateId,
      fontId: card.fontId,
      fontColorId: card.fontColorId,
      fontColorHex: card.fontColorHex,
      collectedAt: new Date().toISOString(),
      folderId: activeFolderId,
      note: null,
      starred: false,
      source,
    };

    return { ok: true, contact };
  } catch {
    return { ok: false, error: 'network' };
  }
}
