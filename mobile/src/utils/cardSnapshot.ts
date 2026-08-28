import { captureRef } from 'react-native-view-shot';

import type { Card } from '@/types/card';
import { supabase } from '@/utils/supabase';

/**
 * A cheap fingerprint of everything the snapshot image is rendered from --
 * the whole card. Used to skip re-capturing content that already has a
 * current image (see useCardSnapshot). Only the visual inputs matter, and
 * the card object is small, so a stable JSON stringify is enough; it does
 * not need to be cryptographic.
 */
export function cardStamp(card: Card): string {
  return JSON.stringify(card);
}

/**
 * Renders the offscreen CardSnapshotComposite (front + back stacked) to a
 * PNG and uploads it to the public `card-snapshots` bucket at a fixed path
 * (`<cardId>.png`, overwritten each time). The back-of-card Master QR
 * encodes the returned public URL: a recruiter scanning it with a stock
 * camera lands on the image and can save it to their photo gallery, with
 * no app or account involved (docs/PRODUCT_REQUIREMENTS.md, MOCKUP_BRIEF
 * §7.5).
 *
 * Best-effort, mirrors linksSync.ts: returns `{ ok, url? }`, never throws.
 * The store keeps the last good URL, so a failed capture (offline, RLS,
 * a transient render) just leaves the previous QR in place.
 */
export interface SnapshotResult {
  ok: boolean;
  url?: string;
}

const BUCKET = 'card-snapshots';

/**
 * The public URL of an object is deterministic from the bucket + path, so
 * we build it rather than round-tripping getPublicUrl -- the path never
 * changes for a given card, only the bytes behind it.
 */
export function cardSnapshotUrl(cardId: string): string {
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${BUCKET}/${cardId}.png`;
}

/** Minimal base64 -> bytes: RN has atob but not Buffer, and we avoid a new dep. */
function base64ToBytes(base64: string): Uint8Array {
  const binary = global.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function syncCardSnapshot(
  cardId: string,
  viewRef: Parameters<typeof captureRef>[0],
): Promise<SnapshotResult> {
  try {
    // result:'base64' skips a file-read round trip. quality:1 -- this is a
    // "visual memory" of the card, so it should be crisp; PNG ignores it
    // for lossless but view-shot still honours the arg on some platforms.
    const base64 = await captureRef(viewRef, { result: 'base64', format: 'png', quality: 1 });
    const bytes = base64ToBytes(base64);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(`${cardId}.png`, bytes, { contentType: 'image/png', upsert: true });
    if (uploadError) return { ok: false };

    const url = cardSnapshotUrl(cardId);

    // Mirror onto the card row so a fresh install / new device gets the URL
    // straight from the cards fetch without waiting for a re-capture.
    // Authorised by cards_update_own. Non-fatal if it fails -- the object
    // itself is already uploaded and the URL is deterministic.
    await supabase.from('cards').update({ master_qr_asset_url: url }).eq('id', cardId);

    return { ok: true, url };
  } catch {
    return { ok: false };
  }
}
