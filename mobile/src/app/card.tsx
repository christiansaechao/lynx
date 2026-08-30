import * as ScreenOrientation from 'expo-screen-orientation';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardFlipContainer } from '@/components/CardFlipContainer';
import { CardSnapshotComposite } from '@/components/CardSnapshotComposite';
import { LinkQRExpanded } from '@/components/LinkQRExpanded';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useCardSnapshot } from '@/hooks/useCardSnapshot';
import { useOrientationLock } from '@/hooks/use-orientation-lock';
import { useCardStore } from '@/store/useCardStore';
import type { Link } from '@/types/card';

// Gives CardFlipContainer's mount work (gesture handlers, tilt
// subscriptions, first layout) time to finish before the welcome text
// starts animating — starting both at once on the same tick is what
// caused a visible stutter right as the text began fading in.
const WELCOME_OVERLAY_SETTLE = 500;
const WELCOME_TEXT_FADE_IN = 3000;
const WELCOME_HOLD = 900;
const WELCOME_TEXT_FADE_OUT = 2000;
const WELCOME_OVERLAY_FADE_OUT = 2000;

export default function CardHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Owned here rather than by CardFlipContainer: the expansion covers the
  // whole screen, and the container is nested inside this screen's
  // safe-area padding, so an overlay rendered there would be inset by it.
  const [expandedLink, setExpandedLink] = useState<Link | null>(null);
  const { welcome } = useLocalSearchParams<{ welcome?: string }>();
  const fullName = useCardStore((state) => state.card.fields.fullName);
  const playWelcome = welcome === '1';

  // Regenerates the Master QR's target image (front + back PNG) whenever
  // the card is edited. The hook mounts the (expensive, 3x-scale) composite
  // only for the capture window -- see useCardSnapshot.
  const { snapshotRef, shouldMount: mountSnapshot } = useCardSnapshot();

  // The overlay stays mounted until this flips — Reanimated drives every
  // stage of the sequence itself (text in, hold, text out, then overlay
  // out), so there's no setTimeout/React-state chain to keep in sync with
  // the animation. The overlay only ever unmounts once its own fade
  // actually finishes, via the callback at the end of the sequence.
  const [overlayDone, setOverlayDone] = useState(!playWelcome);
  const textOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);

  // card.tsx never unmounts while rolodex/scan sit on top of it -- it's
  // only navigated away from. That left its useOrientationLock's AppState
  // listener armed the whole time those screens owned orientation, so any
  // AppState "active" blip during their teardown (camera session close,
  // etc.) made this screen's listener relock LANDSCAPE on top of whatever
  // the focused screen was still settling into -- a third, out-of-order
  // lock call. Suppress this hook whenever card.tsx isn't the focused
  // screen so only one screen's lock is ever armed at a time; the focus
  // effect below is what re-applies LANDSCAPE the instant focus returns.
  const [focused, setFocused] = useState(true);
  const orientationReady = useOrientationLock(ScreenOrientation.OrientationLock.LANDSCAPE, focused);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  useEffect(() => {
    if (!playWelcome || !orientationReady) return;

    textOpacity.value = withDelay(
      WELCOME_OVERLAY_SETTLE,
      withSequence(
        withTiming(1, { duration: WELCOME_TEXT_FADE_IN, easing: Easing.out(Easing.cubic) }),
        withDelay(WELCOME_HOLD, withTiming(0, { duration: WELCOME_TEXT_FADE_OUT, easing: Easing.inOut(Easing.cubic) }))
      )
    );
    overlayOpacity.value = withDelay(
      WELCOME_OVERLAY_SETTLE + WELCOME_TEXT_FADE_IN + WELCOME_HOLD + WELCOME_TEXT_FADE_OUT,
      withTiming(0, { duration: WELCOME_OVERLAY_FADE_OUT, easing: Easing.inOut(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(setOverlayDone)(true);
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playWelcome, orientationReady]);

  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));

  return (
    <View
      style={[
        styles.safeArea,
        {
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
          paddingLeft: insets.left + Spacing.lg,
          paddingRight: insets.right + Spacing.lg,
        },
      ]}>
      <View style={styles.stage}>
        <CardFlipContainer
          mode="view"
          onExpandLink={setExpandedLink}
          onOpenRolodex={() => {
            // Settle the target lock here, before navigating, instead of
            // leaving it to rolodex.tsx's own useOrientationLock(PORTRAIT_UP)
            // mount effect to race against this screen's still-live
            // LANDSCAPE lock -- that race was producing a spurious
            // portrait -> landscape -> portrait triple-rotation on entry
            // (the same class of race fixed for the editor in editor.tsx
            // and CardFlipContainer's pencil handler).
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            router.push('/rolodex');
          }}
          onScan={() => {
            // Same pre-lock as onOpenRolodex above -- scan.tsx also locks
            // PORTRAIT_UP on mount.
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            router.push('/scan');
          }}
        />
      </View>

      <LinkQRExpanded link={expandedLink} onClose={() => setExpandedLink(null)} />

      {mountSnapshot && <CardSnapshotComposite ref={snapshotRef} />}

      {!overlayDone && (
        <Animated.View pointerEvents="none" style={[styles.welcomeOverlay, overlayStyle]}>
          <Animated.View style={textStyle}>
            <ThemedText variant="heading" font="serif" themeColor="text" style={styles.welcomeText}>
              Welcome, {fullName || 'friend'}.
            </ThemedText>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  stage: {
    flex: 1,
  },
  welcomeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    textAlign: 'center',
  },
});
