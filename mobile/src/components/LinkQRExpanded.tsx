import { useEffect } from 'react';
import { BackHandler, Linking, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';

import { ThemedText } from '@/components/themed-text';
import { Motion, Spacing } from '@/constants/theme';
import type { Link } from '@/types/card';

interface LinkQRExpandedProps {
  link: Link | null;
  onClose: () => void;
}

/**
 * The Contextual Expansion state (docs/MOCKUP_BRIEF.md §7.5): a single
 * link's QR, full screen, so a recruiter can scan straight to that URL.
 *
 * Presented on black rather than on the card material — at scan time the
 * card is no longer the subject, the code is, and maximum quiet contrast
 * is what makes it scan reliably.
 *
 * Rotated a quarter turn, exactly as CardBack is: the screen stays locked
 * to landscape, but the card back the user is looking at reads portrait, so
 * the expansion has to match it or the content appears to whip 90deg on
 * open. Rotating in place also keeps the stacked QR/label/button column
 * measured against the screen's long edge, which is what stops it being
 * clipped.
 *
 * Deliberately NOT a native Modal. A Modal mounts into a separate native
 * window, which Reanimated's layout-animation manager cannot resolve
 * against the root tree — entering/exiting on anything inside one is a
 * hard crash on the New Architecture. Rendering as a sibling of the flip
 * stage escapes the card's rotateY/backface-hidden transform (the only
 * thing the Modal was ever needed for) while keeping the animations in a
 * hierarchy Reanimated owns.
 */

/**
 * openURL rejects (rather than resolving false) when nothing on the device
 * can handle the URL, so an unhandled call takes the app down with it.
 */
async function openLink(url: string) {
  if (!url) return;
  try {
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
  } catch (error) {
    console.warn('Could not open link', url, error);
  }
}

export function LinkQRExpanded({ link, onClose }: LinkQRExpandedProps) {
  const { width, height } = useWindowDimensions();
  // The native Modal used to give us Android's back button for free via
  // onRequestClose; as a plain view we wire it up ourselves.
  useEffect(() => {
    if (!link) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [link, onClose]);

  if (!link) return null;

  // rotate spins a view around its centre without reflowing layout, so the
  // upright box has to be sized with width/height swapped before being
  // turned — otherwise the content is portrait but the box it lives in
  // still has landscape proportions and clips. Same trick as CardBack.
  const upright = { width: height, height: width };

  // Once rotated, the column runs along the screen's long edge and the QR's
  // own width is bounded by the short edge. Scaling off the short edge
  // (rather than a fixed 240) is what keeps it inside the frame on small
  // devices, where a landscape viewport is only ~390pt tall.
  const qrSize = Math.max(Math.min(height * 0.55, 260), 140);

  return (
    <Animated.View
      entering={FadeIn.duration(Motion.durations.base)}
      exiting={FadeOut.duration(Motion.durations.fast)}
      style={styles.backdrop}>
      <Pressable style={styles.dismiss} onPress={onClose}>
        <View style={[styles.upright, upright]}>
          <Animated.View entering={ZoomIn.duration(Motion.durations.base)} style={styles.plate}>
            <QRCode value={link.url || 'https://lynx.app'} size={qrSize} color="#000000" backgroundColor="#ffffff" />
          </Animated.View>

          <ThemedText variant="label" style={styles.platform}>
            {link.platform.toUpperCase()}
          </ThemedText>
          {/* The QR is for someone else's phone; this is for the card's
              owner (or anyone holding the device) to follow it directly. */}
          <Pressable
            style={styles.openButton}
            onPress={() => openLink(link.url)}
            hitSlop={Spacing.sm}>
            <ThemedText variant="button" style={styles.openLabel}>
              OPEN LINK
            </ThemedText>
          </Pressable>

          <ThemedText variant="caption" style={styles.hint}>
            Tap anywhere else to close
          </ThemedText>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    // Above the flip stage and the pencil affordance.
    zIndex: 10,
    elevation: 10,
  },
  dismiss: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Turned to match the card back, which is itself rotated a quarter turn
  // inside the landscape-locked screen.
  upright: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    transform: [{ rotate: '-90deg' }],
  },
  // A quiet zone of white around the code is what makes it scannable; the
  // plate provides it regardless of what sits behind the overlay.
  plate: {
    padding: Spacing.md,
    backgroundColor: '#ffffff',
    borderRadius: Spacing.sm,
  },
  platform: {
    color: '#ffffff',
  },
  // Sized as a primary action, not a footnote: generous vertical padding
  // and a wide-but-contained hit area. Hugs its label rather than
  // stretching, so it never runs to the screen edges.
  openButton: {
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderWidth: 1,
    borderColor: '#B0B4BA',
    borderRadius: Spacing.sm,
  },
  openLabel: {
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  hint: {
    color: '#B0B4BA',
  },
});
