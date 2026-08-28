import { useEffect, useRef } from 'react';
import type { View } from 'react-native';

import { useCardStore } from '@/store/useCardStore';
import { updateCachedSnapshotUrl } from '@/utils/cardCache';
import { cardStamp, syncCardSnapshot } from '@/utils/cardSnapshot';

/**
 * Keeps the Master QR's target image in sync with the card. When the card's
 * content changes -- any field, link, material, template, font, colour, or
 * per-field style -- this re-renders the offscreen CardSnapshotComposite to
 * a PNG, uploads it to the `card-snapshots` bucket, and records the public
 * URL (+ the content fingerprint it was captured from) in the store and
 * local cache.
 *
 * Two guards against wasted uploads:
 *  - Debounced by DEBOUNCE_MS, so a burst of edits (dragging a colour
 *    slider fires dozens of setField calls) collapses to one capture after
 *    the edits stop.
 *  - Gated on `cardStamp(card) !== snapshotStamp`, held in the store rather
 *    than a hook ref. Navigating between the card and editor screens
 *    remounts this hook; without a shared stamp each remount would
 *    re-capture unchanged content. With it, only a real content change
 *    triggers work.
 *
 * Returns the ref for <CardSnapshotComposite ref={...} />. No-ops entirely
 * on the seeded mockup (cardId null) -- nothing is persisted there.
 */
const DEBOUNCE_MS = 1000;

export function useCardSnapshot() {
  const compositeRef = useRef<View>(null);
  const card = useCardStore((s) => s.card);
  const cardId = useCardStore((s) => s.cardId);
  const userId = useCardStore((s) => s.userId);
  const snapshotStamp = useCardStore((s) => s.snapshotStamp);
  const setSnapshot = useCardStore((s) => s.setSnapshot);

  useEffect(() => {
    if (!cardId || !userId) return;

    // The image on file already matches this exact content (either just
    // captured, or hydrated from cards.master_qr_asset_url on load).
    const stamp = cardStamp(card);
    if (stamp === snapshotStamp) return;

    const timer = setTimeout(async () => {
      if (!compositeRef.current) return;
      const result = await syncCardSnapshot(cardId, compositeRef.current);
      if (!result.ok || !result.url) return;

      // Stamp with the content this capture actually rendered. If an edit
      // landed mid-upload, the store's stamp still won't match the newer
      // content and the effect re-fires for it -- no missed capture.
      setSnapshot({ url: result.url, stamp });
      void updateCachedSnapshotUrl(userId, result.url);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [card, cardId, userId, snapshotStamp, setSnapshot]);

  return compositeRef;
}
