import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { getCardTemplate } from '@/constants/cardTemplates';
import { getCardFont } from '@/constants/fonts';
import { getCardFontColor } from '@/constants/fontColors';
import { getCardMaterial } from '@/constants/materials';
import { Card } from '@/constants/theme';
import type { CardFontColorId, CardFontId, CardMaterialId, CardTemplateId } from '@/types/card';

interface CardMaterialProps {
  templateId: CardTemplateId;
  materialId: CardMaterialId;
  tilt: { beta: SharedValue<number>; gamma: SharedValue<number> } | null;
  children?: React.ReactNode;
}

const TRANSLATE_MULTIPLIER = 1.2;

// The magnitude ramp: tilt (in degrees) is divided by this before being
// clamped to 0..1, so the glare reaches full strength at ~18deg of tilt.
const TILT_FULL_SCALE = 18;

export function CardMaterial({ templateId, materialId, tilt, children }: CardMaterialProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const material = getCardMaterial(materialId);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    // Only commit on real changes (onLayout can re-fire with identical
    // values during the flip animation) so this doesn't fight the 60fps
    // tilt-driven animated style with extra re-renders.
    setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  const { restOpacity, tiltOpacity } = material.glare;

  const glareStyle = useAnimatedStyle(() => {
    // tilt is omitted for faces that want a flat, static presentation (the
    // link-heavy back face) so the glare isn't a distraction there -- it
    // still shows the material's rest sheen, just without the motion.
    if (!tilt) return { opacity: restOpacity };
    const tiltX = tilt.gamma.value;
    const tiltY = tilt.beta.value;
    const magnitude = Math.min(Math.sqrt(tiltX * tiltX + tiltY * tiltY) / TILT_FULL_SCALE, 1);
    return {
      opacity: restOpacity + magnitude * tiltOpacity,
      transform: [
        { translateX: tiltX * TRANSLATE_MULTIPLIER },
        { translateY: tiltY * TRANSLATE_MULTIPLIER },
      ],
    };
  });

  // Oversize past the card's own footprint so the soft falloff always
  // spans the full card on both axes, long or short, instead of clipping
  // before it reaches the far edges.
  const overscanX = size.width * 0.6;
  const overscanY = size.height * 0.6;

  return (
    <View style={styles.container} onLayout={onLayout}>
      <LinearGradient
        colors={material.background.colors}
        start={material.background.start}
        end={material.background.end}
        style={StyleSheet.absoluteFill}
      />
      {size.width > 0 && size.height > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            glareStyle,
            {
              position: 'absolute',
              left: -overscanX,
              top: -overscanY,
              width: size.width + overscanX * 2,
              height: size.height + overscanY * 2,
            },
          ]}>
          <LinearGradient
            colors={['transparent', material.glare.color, 'transparent']}
            locations={[0, 0.5, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
      {children}
    </View>
  );
}

/**
 * The text-shadow that sells a material's relief: embossed ink sits proud
 * of the surface (a soft light-toned shadow dropped below it), debossed ink
 * is pressed in (a dark shadow above it), flat ink casts nothing. Returned
 * as a style fragment so CardFront can spread it onto every field.
 */
function reliefTextShadow(relief: ReturnType<typeof getCardMaterial>['relief']): TextStyle {
  switch (relief) {
    case 'embossed':
      return {
        textShadowColor: 'rgba(255,255,255,0.55)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
      };
    case 'debossed':
      return {
        textShadowColor: 'rgba(0,0,0,0.55)',
        textShadowOffset: { width: 0, height: -1 },
        textShadowRadius: 1,
      };
    default:
      return {};
  }
}

/**
 * Resolves a card's full visual style. Ownership is split:
 *   - the material owns the surface and the ink -- background, textColor,
 *     labelColor, and the relief text-shadow;
 *   - the template owns the type layout -- fontFamily and letter-spacing;
 *   - the independent Fonts / Font Color axes (constants/fonts.ts,
 *     constants/fontColors.ts) override fontFamily and the ink colors when
 *     the card has explicitly picked one.
 */
export function useCardTemplateStyle(
  templateId: CardTemplateId,
  materialId: CardMaterialId,
  fontId?: CardFontId,
  fontColorId?: CardFontColorId,
) {
  const template = getCardTemplate(templateId);
  const material = getCardMaterial(materialId);
  const fontFamily = fontId ? getCardFont(fontId).id : template.fontFamily;
  const colorOverride = fontColorId ? getCardFontColor(fontColorId) : null;

  return {
    ...template,
    fontFamily,
    textColor: colorOverride?.textColor ?? material.textColor,
    labelColor: colorOverride?.labelColor ?? material.labelColor,
    reliefTextShadow: reliefTextShadow(material.relief),
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: Card.radius,
  },
});
