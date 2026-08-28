import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useAuthStore } from '@/store/useAuthStore';

/**
 * Entry router. Resolves three states rather than always sending users to
 * login: signed out, signed in without a card yet, and signed in with a card.
 *
 * This is the one screen outside every Stack.Protected block, which makes it
 * the fallback the router falls back to when a guard denies a route. It must
 * therefore never redirect into a route whose guard is currently false -- that
 * target is not a registered route at all while the guard is down, and the
 * redirect would bounce straight back here.
 */
export default function Index() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const session = useAuthStore((s) => s.session);
  const cardStatus = useAuthStore((s) => s.cardStatus);

  // Splash is still covering the screen here, so hold on a matching black
  // field rather than committing to a route we may have to navigate away from
  // as soon as the real state lands.
  if (isLoading) return <Hold />;

  if (!session) return <Redirect href="/login" />;

  // Session is live but the cards probe has not answered. Holding is what keeps
  // a user who already has a card from being flashed through onboarding while
  // the query is in flight.
  if (cardStatus === 'unknown') return <Hold />;

  if (cardStatus === 'missing') return <Redirect href="/onboarding" />;

  return <Redirect href="/card" />;
}

function Hold() {
  return <View style={{ flex: 1, backgroundColor: '#000000' }} />;
}
