import { useEffect } from 'react';

import { useAuthStore } from '@/store/useAuthStore';
import { useCardStore } from '@/store/useCardStore';
import { loadCardCache, saveCardCache } from '@/utils/cardCache';
import { syncReplaceAllLinks } from '@/utils/linksSync';
import { cardStamp } from '@/utils/cardSnapshot';
import { mapCardRow } from '@/utils/mapCardRow';
import { supabase } from '@/utils/supabase';

/**
 * Owns the Supabase session lifecycle for the app.
 *
 * Renders nothing: it is mounted once at the root purely for its effects, so
 * that session state lives in the store rather than in React context. Screens
 * read it via useAuthStore.
 */
export function AuthProvider() {
  const setSession = useAuthStore((s) => s.setSession);
  const setLoaded = useAuthStore((s) => s.setLoaded);
  const setCardStatus = useAuthStore((s) => s.setCardStatus);

  useEffect(() => {
    let active = true;

    // getSession() reads from AsyncStorage rather than hitting the network, so
    // cold start resolves fast and works offline. The docs warn against
    // getSession() where the storage may not be authentic (cookie-based server
    // contexts) -- on device, AsyncStorage is trusted, and RLS re-validates
    // every JWT server-side regardless of what the client believes here.
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoaded();
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // This callback MUST stay synchronous. Any async Supabase call made in
      // here (postgrest, storage, functions) deadlocks the client: those calls
      // go through a fetch that needs the same lock auth is already holding,
      // and the next Supabase call anywhere in the app then hangs forever.
      // See supabase/gotrue-js#762. The cards lookup lives in the effect below
      // for exactly this reason -- do not move it in here.
      setSession(session);

      // Covers the cold-start path where onAuthStateChange fires INITIAL_SESSION
      // before the getSession() promise above resolves.
      setLoaded();
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [setSession, setLoaded]);

  const userId = useAuthStore((s) => s.session?.user.id);
  const setCard = useCardStore((s) => s.setCard);
  const setIdentity = useCardStore((s) => s.setIdentity);
  const setSnapshot = useCardStore((s) => s.setSnapshot);

  // Deliberately outside the auth callback (see above). Keyed on the user id so
  // it re-probes when a different user signs in on the same device.
  useEffect(() => {
    if (!userId) return;

    let active = true;

    supabase
      .from('cards')
      .select('*, links(*)')
      .eq('owner_user_id', userId)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (!active) return;

        if (error || !data) {
          // Network/DB unreachable (or no row yet). Fall back to the local
          // cache so a relaunch offline still shows the user's real card
          // instead of the seeded mockup. Status stays 'unknown' on error --
          // guessing 'missing' would push a user who already has a card back
          // through onboarding, where MINT CARD hits the unique constraint on
          // cards.owner_user_id.
          if (error) {
            const cached = await loadCardCache(userId);
            if (active && cached) {
              setCard(cached.card);
              setIdentity({ cardId: cached.cardId, userId });
              // The cached URL's image was captured from the cached card, so
              // stamp it as current -- no re-capture needed just for loading.
              if (cached.snapshotUrl) {
                setSnapshot({ url: cached.snapshotUrl, stamp: cardStamp(cached.card) });
              }
            }
            return;
          }
          setCardStatus('missing');
          return;
        }

        // Displace the store's seeded mockup content with the user's real
        // card. Without this, a returning user (relaunch, new device) skips
        // onboarding via cardStatus='exists' and lands on the card screen
        // still showing the seeded Patrick Bateman / Pierce & Pierce data --
        // onboarding.tsx's setCard() call never runs for them.
        const { links, ...row } = data;
        const card = mapCardRow(row, links);
        setCard(card);
        setIdentity({ cardId: row.id, userId });
        // The stored image was captured from this same card row -- stamp it
        // current so a plain app-open doesn't trigger a re-capture.
        if (row.master_qr_asset_url) {
          setSnapshot({ url: row.master_qr_asset_url, stamp: cardStamp(card) });
        }
        setCardStatus('exists');

        // DB wins when reachable: refresh the cache to match. But if a prior
        // session marked the cache dirty (links edited offline), re-push
        // those first so the offline edits aren't silently lost to this
        // fetch, then cache the pushed state.
        const cached = await loadCardCache(userId);
        if (!active) return;
        if (cached?.dirty && cached.cardId === row.id) {
          const result = await syncReplaceAllLinks(row.id, cached.card.links);
          if (!active) return;
          if (result.ok) {
            setCard(cached.card);
            await saveCardCache(userId, {
              cardId: row.id,
              card: cached.card,
              dirty: false,
              snapshotUrl: row.master_qr_asset_url ?? null,
            });
            return;
          }
        }
        await saveCardCache(userId, {
          cardId: row.id,
          card,
          dirty: false,
          snapshotUrl: row.master_qr_asset_url ?? null,
        });
      });

    return () => {
      active = false;
    };
  }, [userId, setCardStatus, setCard, setIdentity, setSnapshot]);

  return null;
}
