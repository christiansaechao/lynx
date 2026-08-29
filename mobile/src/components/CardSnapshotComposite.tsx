import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { CardBack } from '@/components/CardBack';
import { CardFront } from '@/components/CardFront';
import { Card } from '@/constants/theme';

/**
 * The Master QR points at a PNG of the card, front and back, stacked --
 * neither face alone is the "visual memory" the product brief describes
 * (docs/PRODUCT_REQUIREMENTS.md, MOCKUP_BRIEF §7.5). This component is that
 * PNG's source: it renders both faces at a fixed size for
 * react-native-view-shot's captureRef.
 *
 * Mounted offscreen (see styles.host). It is mounted only transiently, for
 * the capture window itself -- useCardSnapshot flips it in after the edit
 * debounce, waits for layout, captures, then unmounts it -- because at 3x
 * scale re-rendering it on every edit stalled the visible card. It is NOT
 * interactive -- editable={false}, and the tilt inputs are pinned to zero
 * so the capture is a flat, glare-free reference image.
 */

const CAPTURE_WIDTH = 1050; // 3x a 350pt card face -- crisp when zoomed on a phone
const FACE_HEIGHT = CAPTURE_WIDTH / Card.aspectRatio;

export const CardSnapshotComposite = forwardRef<View>((_props, ref) => {
  // CardFront/CardBack require a tilt pair; a static zero pair gives the
  // flat presentation and never updates, so no animation runs here.
  const beta = useSharedValue(0);
  const gamma = useSharedValue(0);
  const tilt = { beta, gamma };

  return (
    <View style={styles.host} pointerEvents="none" collapsable={false}>
      <View ref={ref} collapsable={false} style={styles.sheet}>
        <View style={[styles.face, { width: CAPTURE_WIDTH, height: FACE_HEIGHT }]}>
          <CardFront editable={false} tilt={tilt} forSnapshot />
        </View>
        <View style={[styles.face, { width: CAPTURE_WIDTH, height: FACE_HEIGHT }]}>
          <CardBack editable={false} forSnapshot />
        </View>
      </View>
    </View>
  );
});

CardSnapshotComposite.displayName = 'CardSnapshotComposite';

const styles = StyleSheet.create({
  // Pushed well off any screen edge in both axes. position:absolute keeps
  // it out of the real layout; the large offsets keep it from ever
  // painting even mid-transition.
  host: {
    position: 'absolute',
    left: -10000,
    top: -10000,
    opacity: 0,
  },
  sheet: {
    backgroundColor: '#000000',
  },
  face: {
    overflow: 'hidden',
  },
});
