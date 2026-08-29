import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager, type View } from 'react-native';

import { useCardStore } from '@/store/useCardStore';
import { updateCachedSnapshotUrl } from '@/utils/cardCache';
import { cardStamp, syncCardSnapshot } from '@/utils/cardSnapshot';

/**
 * Keeps the Master QR's target image in sync with the card. When the card's
 * content changes -- any field, link, material, template, font, colour, or
 * per-field style -- this renders the offscreen CardSnapshotComposite to a
 * PNG, uploads it to the `card-snapshots` bucket, and records the public URL
 * (+ the content fingerprint it was captured from) in the store and local
 * cache.
 *
 * The composite is a full second copy of both card faces at 3x scale
 * (1050px wide) -- rendering it is expensive (the Master QR SVG, the
 * oversized gradient layers). It is therefore NOT kept mounted: doing so
 * put that render on the critical path of every swatch tap / keystroke,
 * stalling the visible card by seconds. Instead this hook drives a
 * transient mount:
 *
 *   1. A card change starts the DEBOUNCE_MS timer (a burst of edits
 *      collapses to one capture after the edits stop).
 *   2. When it fires, `shouldMount` flips true and the editor renders the
 *      composite offscreen.
 *   3. After a frame for layout, captureRef runs, the PNG uploads, and
 *      `shouldMount` flips back to false -- the composite leaves the tree.
 *
 * Gated on `cardStamp(card) !== snapshotStamp` (held in the store, not a
 * ref, so navigating between the card and editor screens can't trigger a
 * redundant capture of unchanged content).
 *
 * Returns { snapshotRef, shouldMount }. No-ops entirely on the seeded
 * mockup (cardId null) -- nothing is persisted there, and shouldMount
 * stays false.
 */
// A first-time user often taps through every material/template in quick
// succession just to see the options. Each tap restarts this timer, so the
// expensive capture only runs once they've settled on something for a few
// seconds -- not once per tap mid-browse.
const DEBOUNCE_MS = 4000;

export function useCardSnapshot() {
  const compositeRef = useRef<View>(null);
  const [shouldMount, setShouldMount] = useState(false);
  const card = useCardStore((s) => s.card);
  const cardId = useCardStore((s) => s.cardId);
  const userId = useCardStore((s) => s.userId);
  const snapshotStamp = useCardStore((s) => s.snapshotStamp);
  const setSnapshot = useCardStore((s) => s.setSnapshot);

  // The stamp of the content the pending mount is meant to capture. Set when
  // the debounce fires, read back once the composite has mounted.
  const pendingStamp = useRef<string | null>(null);

  useEffect(() => {
    if (!cardId || !userId) return;

    // The image on file already matches this exact content (either just
    // captured, or hydrated from cards.master_qr_asset_url on load).
    const stamp = cardStamp(card);
    if (stamp === snapshotStamp) return;

    const timer = setTimeout(() => {
      // Mount the composite; the capture itself waits for its layout pass
      // in the effect below.
      pendingStamp.current = stamp;
      setShouldMount(true);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [card, cardId, userId, snapshotStamp]);

  // Runs once the composite is actually in the tree. Waits for the current
  // interaction/animation to settle and a frame for layout, then captures.
  useEffect(() => {
    if (!shouldMount) return;

    let cancelled = false;
    const stamp = pendingStamp.current;

    const handle = InteractionManager.runAfterInteractions(() => {
      // One more frame so the freshly-mounted 1050px composite has laid out
      // before view-shot reads it.
      requestAnimationFrame(async () => {
        if (cancelled) return;
        const node = compositeRef.current;
        const activeCardId = useCardStore.getState().cardId;
        const activeUserId = useCardStore.getState().userId;

        if (node && stamp && activeCardId && activeUserId) {
          const result = await syncCardSnapshot(activeCardId, node);
          if (!cancelled && result.ok && result.url) {
            // Stamp with the content this capture actually rendered. If an
            // edit landed since, the store stamp still won't match the
            // newer content and the debounce effect re-fires for it.
            setSnapshot({ url: result.url, stamp });
            void updateCachedSnapshotUrl(activeUserId, result.url);
          }
        }

        if (!cancelled) {
          pendingStamp.current = null;
          setShouldMount(false);
        }
      });
    });

    return () => {
      cancelled = true;
      handle.cancel();
    };
  }, [shouldMount, setSnapshot]);

  const setRef = useCallback((node: View | null) => {
    compositeRef.current = node;
  }, []);

  return { snapshotRef: setRef, shouldMount };
}
