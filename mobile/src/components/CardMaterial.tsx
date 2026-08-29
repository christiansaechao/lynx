import { LinearGradient } from 'expo-linear-gradient';
import { memo, useMemo, useState } from 'react';
import { Image, StyleSheet, View, type LayoutChangeEvent, type TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { getCardTemplate } from '@/constants/cardTemplates';
import { getCardFont } from '@/constants/fonts';
import { getCardFontColor } from '@/constants/fontColors';
import { deriveLabelColor } from '@/utils/color';
import { getCardMaterial } from '@/constants/materials';
import { Card } from '@/constants/theme';
import type { CardFontColorId, CardFontId, CardMaterialId, CardTemplateId } from '@/types/card';

interface CardMaterialProps {
  templateId: CardTemplateId;
  materialId: CardMaterialId;
  tilt: { beta: SharedValue<number>; gamma: SharedValue<number> } | null;
  /**
   * Force a translucent material's base layer fully opaque. Set by the
   * offscreen snapshot composite: its sheet is solid black, so letting the
   * backdrop bleed through would darken the captured card.
   */
  opaque?: boolean;
  children?: React.ReactNode;
}

const TRANSLATE_MULTIPLIER = 1.2;

// Hoisted so the LinearGradient sees the same array identity every render.
const GLARE_LOCATIONS = [0, 0.5, 1] as const;
const GLARE_START = { x: 0.5, y: 0 } as const;
const GLARE_END = { x: 0.5, y: 1 } as const;

// The magnitude ramp: tilt (in degrees) is divided by this before being
// clamped to 0..1, so the glare reaches full strength at ~18deg of tilt.
const TILT_FULL_SCALE = 18;

// A global damp on the glare overlay -- the per-material rest/tilt opacities
// were tuned a touch hot, so scale both down here rather than re-tuning
// every material entry. Lower = more subtle sheen.
const GLARE_DAMP = 0.65;

function CardMaterialImpl({ templateId, materialId, tilt, opaque, children }: CardMaterialProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const material = getCardMaterial(materialId);

  // Both gradients paint a CAGradientLayer on iOS that repaints whenever its
  // `colors` prop is a new array. `material.background.colors` is already a
  // stable module-level reference; the glare's is built here, so memoize it
  // on the one value it depends on.
  const glareColors = useMemo(
    () => ['transparent', material.glare.color, 'transparent'] as const,
    [material.glare.color],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    // Only commit on real changes (onLayout can re-fire with identical
    // values during the flip animation) so this doesn't fight the 60fps
    // tilt-driven animated style with extra re-renders.
    setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  const restOpacity = material.glare.restOpacity * GLARE_DAMP;
  const tiltOpacity = material.glare.tiltOpacity * GLARE_DAMP;

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
  // spans the full card on both axes as it translates with tilt. Kept
  // modest (was 0.6) -- the tilt translate maxes at ~22px, so this is well
  // clear of the travel while staying cheap for iOS to repaint on a
  // material swap. A large one (2x+ the card, overflowing the rounded
  // container) forced a seconds-long offscreen masking pass on every swap.
  const overscanX = size.width * 0.25;
  const overscanY = size.height * 0.25;

  // Translucent finishes (Frosted Glass) paint their base gradient below
  // full opacity so the backdrop shows through faintly. Forced solid for
  // the snapshot composite (opaque).
  const baseOpacity = material.translucent && !opaque ? material.translucent.alpha : 1;

  const { texture } = material;
  // One 1024px source stretched to cover the whole face -- NOT tiled.
  // resizeMode="repeat" made the tile boundaries visible as a grid even
  // with a seamless source; at overlay opacity a single stretched grain
  // field reads fine and can never seam. Rendered as one absoluteFill
  // Image under the glare (or over it for matte finishes); a material swap
  // just swaps the source, no per-frame cost.
  const textureLayer = texture ? (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={texture.source}
        resizeMode="cover"
        style={[StyleSheet.absoluteFill, { opacity: texture.opacity }]}
      />
    </View>
  ) : null;

  return (
    <View style={styles.container} onLayout={onLayout}>
      <LinearGradient
        colors={material.background.colors}
        start={material.background.start}
        end={material.background.end}
        style={[StyleSheet.absoluteFill, baseOpacity < 1 && { opacity: baseOpacity }]}
      />
      {texture && !texture.overGlare && textureLayer}
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
            colors={glareColors}
            locations={GLARE_LOCATIONS}
            start={GLARE_START}
            end={GLARE_END}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
      {texture && texture.overGlare && textureLayer}
      {children}
    </View>
  );
}

// Memoized: a change to any unrelated card field (a link edit, a font swap)
// re-renders CardFront, which would otherwise repaint both gradient layers
// here -- the oversized glare layer especially -- on every commit. Only a
// real material/template/tilt change should reach this.
export const CardMaterial = memo(CardMaterialImpl);

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
  fontColorHex?: string,
) {
  const template = getCardTemplate(templateId);
  const material = getCardMaterial(materialId);
  const fontFamily = fontId ? getCardFont(fontId).id : template.fontFamily;

  // A custom hex wins over a preset, which wins over the material's own
  // ink. The custom label colour is derived; presets carry their own.
  const colorOverride = fontColorHex
    ? { textColor: fontColorHex, labelColor: deriveLabelColor(fontColorHex) }
    : fontColorId
      ? getCardFontColor(fontColorId)
      : null;

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
