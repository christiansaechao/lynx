import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// useDeviceTilt already reports beta/gamma relative to the hold posture at
// mount time, so clamp is the only thing needed here.
const TILT_CLAMP = 18;

function clamp(value: number, limit: number) {
  'worklet';
  return Math.max(-limit, Math.min(limit, value));
}

import { CardBack } from '@/components/CardBack';
import { CardFront } from '@/components/CardFront';
import { Card, Motion, Spacing } from '@/constants/theme';
import { useDeviceTilt } from '@/hooks/use-device-tilt';
import { useTheme } from '@/hooks/use-theme';
import { useCardTemplateStyle } from '@/components/CardMaterial';
import { useCardStore } from '@/store/useCardStore';
import type { EditableFieldKey, Link } from '@/types/card';

interface CardFlipContainerProps {
  mode: 'view' | 'edit';
  onSelectField?: (key: EditableFieldKey) => void;
  onAddLink?: () => void;
  onSelectLink?: (id: string) => void;
  onEdit?: (face: 'front' | 'back') => void;
  /** Which face the card is showing on mount. */
  initialFace?: 'front' | 'back';
  /**
   * Viewing a link's QR. The expansion covers the whole screen, so it is
   * rendered by the screen — outside its safe-area padding — rather than
   * here inside the padded card stage.
   */
  onExpandLink?: (link: Link) => void;
  /** Forwarded to CardFront — see its prop doc. */
  inputAccessoryViewID?: string;
}

export function CardFlipContainer({
  mode,
  onSelectField,
  onAddLink,
  onSelectLink,
  onEdit,
  onExpandLink,
  initialFace = 'front',
  inputAccessoryViewID,
}: CardFlipContainerProps) {
  const router = useRouter();
  const theme = useTheme();
  const card = useCardStore((state) => state.card);
  const textColor = useCardTemplateStyle(card.templateId, card.materialId).textColor;
  const tilt = useDeviceTilt();

  const editable = mode === 'edit';

  const flip = useSharedValue(initialFace === 'back' ? 1 : 0); // 0 = front, 1 = back
  const flipSign = useSharedValue(1); // 1 = flipping via a left->right swipe, -1 = right->left
  const [face, setFace] = useState<'front' | 'back'>(initialFace);
  const [tappedFace, setTappedFace] = useState<'front' | 'back' | null>(null);

  const flipTo = (target: 'front' | 'back') => {
    flip.value = withTiming(target === 'back' ? 1 : 0, { duration: Motion.durations.flip });
    setFace(target);
    // A flip (fling or otherwise) is a navigation gesture, not a tap on the
    // face you land on — the pencil should only reappear from a real tap.
    setTappedFace(null);
  };

  // Fling's event payload doesn't report which way it was swiped, so a Pan
  // is used instead to read velocityX and get an actual swipe direction.
  const SWIPE_VELOCITY_THRESHOLD = 800;
  const fling = Gesture.Pan().onEnd((event) => {
    if (Math.abs(event.velocityX) < SWIPE_VELOCITY_THRESHOLD) return;
    // The card should rotate away in the direction it was swiped: a
    // left->right swipe leads with the right edge, right->left leads
    // with the left edge, so the rotation direction has to mirror it.
    // The back face is presented mirrored (it's the reverse side of the
    // same 3D flip), so a swipe that reads as the same on-screen direction
    // needs the opposite sign there.
    const velocitySign = event.velocityX < 0 ? -1 : 1;
    flipSign.value = face === 'back' ? -velocitySign : velocitySign;
    // onEnd runs on the UI thread; flipTo touches React state, so it must
    // be marshalled back to the JS thread or this crashes.
    runOnJS(flipTo)(face === 'front' ? 'back' : 'front');
  });

  const frontStyle = useAnimatedStyle(() => {
    const tiltX = clamp(tilt.beta.value, TILT_CLAMP);
    const tiltY = clamp(tilt.gamma.value, TILT_CLAMP);
    return {
      transform: [
        { perspective: 1200 },
        { rotateX: `${tiltX * -0.5}deg` },
        { rotateY: `${flipSign.value * interpolate(flip.value, [0, 1], [0, 180]) + tiltY * 0.5}deg` },
      ],
      opacity: interpolate(flip.value, [0, 0.5, 0.5001, 1], [1, 1, 0, 0]),
      backfaceVisibility: 'hidden',
    };
  });

  // The back face stays flat/static once flipped into view — no gyroscope
  // tilt jitter, since it's a link list, not a glare/tilt surface.
  const backStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${flipSign.value * interpolate(flip.value, [0, 1], [-180, 0])}deg` },
      ],
      opacity: interpolate(flip.value, [0, 0.4999, 0.5, 1], [0, 0, 1, 1]),
      backfaceVisibility: 'hidden',
    };
  });

  const handleTap = () => {
    if (editable) return;
    setTappedFace(face);
  };

  const showPencil = !editable && tappedFace === face;

  return (
    <GestureDetector gesture={fling}>
        <Animated.View style={styles.stage}>
          <Animated.View
            style={[StyleSheet.absoluteFill, frontStyle, { pointerEvents: face === 'front' ? 'auto' : 'none' }]}>
            <CardFront
              editable={editable}
              tilt={tilt}
              onSelectField={onSelectField}
              onTap={handleTap}
              inputAccessoryViewID={inputAccessoryViewID}
            />
          </Animated.View>
          <Animated.View
            style={[StyleSheet.absoluteFill, backStyle, { pointerEvents: face === 'back' ? 'auto' : 'none' }]}>
            <CardBack
              editable={editable}
              onAddLink={onAddLink}
              onSelectLink={onSelectLink}
              onTap={handleTap}
              onExpandLink={onExpandLink}
              onOpenSettings={() => (onEdit ? onEdit('back') : router.push('/editor?face=back'))}
            />
          </Animated.View>

          {showPencil && (
            <Animated.View
              entering={FadeIn.duration(Motion.durations.base)}
              style={[styles.pencil, { pointerEvents: 'box-none' }]}>
              <Pressable onPress={() => (onEdit ? onEdit(face) : router.push(`/editor?face=${face}`))}>
                <SymbolView
                  name="pencil"
                  size={20}
                  weight="medium"
                  tintColor={textColor ?? theme.text}
                />
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    borderRadius: Card.radius,
  },
  pencil: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
  },
});
