import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { CardMaterial, useCardTemplateStyle } from '@/components/CardMaterial';
import { LinkGlyph } from '@/components/LinkGlyph';
import { ThemedText } from '@/components/themed-text';
import { Card, Spacing } from '@/constants/theme';
import { useDeviceOrientation } from '@/hooks/use-device-orientation';
import { useCardStore } from '@/store/useCardStore';
import type { Link } from '@/types/card';

interface CardBackProps {
  editable: boolean;
  onAddLink?: () => void;
  onSelectLink?: (id: string) => void;
  onTap?: () => void;
  /**
   * Rendered inside CardSnapshotComposite -- the face being captured as the
   * PNG that the Master QR itself points at. Suppresses the Master QR here
   * so the image doesn't bake in a (now stale) copy of the very code that
   * loaded it; everything else about the face is unchanged.
   */
  forSnapshot?: boolean;
  /**
   * Viewing a link's QR. Owned by the parent because the modal must mount
   * outside this face's 3D/backface-hidden transform — see CardFlipContainer.
   */
  onExpandLink?: (link: Link) => void;
}

/**
 * The App Grid is a 2x2 quadrant block. The four cells are divided by a
 * cross: inner borders only (right edge of the left column, bottom edge of
 * the top row), so the seams meet in the middle and no border runs along
 * the outside of the block.
 */
const GRID_COLUMNS = 2;
const GRID_CELLS = 4;

export function CardBack({
  editable,
  onAddLink,
  onSelectLink,
  onTap,
  onExpandLink,
  forSnapshot = false,
}: CardBackProps) {
  const card = useCardStore((state) => state.card);
  // The Master QR encodes the URL of the rendered front+back snapshot (see
  // useCardSnapshot / cardSnapshot.ts). Null until the first capture lands;
  // while null we suppress the code rather than point it at a dead
  // placeholder domain.
  const snapshotUrl = useCardStore((state) => state.snapshotUrl);
  const showMasterQR = !forSnapshot && !!snapshotUrl;
  const template = useCardTemplateStyle(card.templateId, card.materialId);
  const textColor = template.textColor;

  // isActive: false is hidden, never deleted — the editor still needs to
  // see and toggle those, so they stay visible while editing only.
  const visibleLinks = card.links.filter((link) => link.isActive || editable);

  // The card itself is a fixed landscape object, but the screen around it
  // no longer is (the editor frees rotation — see use-orientation-lock).
  // Held in landscape the card fills the screen as designed and the back
  // face just needs its quarter-turn in place to read upright; held in
  // portrait the screen itself is already the right way round, so the
  // rotation would turn it sideways instead of fixing it.
  const { isLandscape } = useDeviceOrientation();

  // transform: rotate spins a view around its center without reflowing
  // layout, so in landscape the wrapper has to be sized with width/height
  // swapped before being turned 90deg — otherwise the text is upright but
  // the box it lives in still has landscape proportions. In portrait no
  // rotation is applied, so the box keeps its natural (already-portrait)
  // dimensions.
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setFrame((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  const rotated = isLandscape
    ? { width: frame.height, height: frame.width, transform: [{ rotate: '-90deg' as const }] }
    : { width: frame.width, height: frame.height, transform: [] };

  // The Master QR anchors the top of the card and is meant to dominate it:
  // it spans the full portrait width minus the card padding and the white
  // quiet-zone plate on either side, so the only breathing room left is an
  // even margin across the top and down both sides. rotated.width is the
  // inner box's effective width once rotation is accounted for -- frame
  // (the outer, unrotated box) is landscape-shaped in landscape mode but
  // already portrait-shaped in portrait mode, so sizing off frame.height
  // directly is only correct in the landscape case.
  const masterSize = Math.max(rotated.width - Card.padding * 2 - Spacing.sm * 2, 120);
  const glyphSize = Math.max(Math.min(rotated.width * 0.105, 40), 22);

  // Exactly four slots, so the cross always reads as a cross. In the
  // editor the first free slot becomes the Add affordance; the rest stay
  // empty rather than letting the block collapse.
  const gridCells: (Link | 'add' | null)[] = Array.from({ length: GRID_CELLS }, (_, index) => {
    if (index < visibleLinks.length) return visibleLinks[index];
    if (editable && index === visibleLinks.length) return 'add';
    return null;
  });

  const handlePressLink = (link: Link) => {
    // In the editor a tap means "edit this link"; when viewing, it means
    // "expand to a scannable full-screen QR" (the Contextual Expansion).
    if (editable) onSelectLink?.(link.id);
    else onExpandLink?.(link);
  };

  return (
    <Pressable style={styles.pressable} onPress={onTap}>
        {/* No tilt: the back is a flat, static sharing hub, not a glare/tilt surface. */}
        <CardMaterial templateId={card.templateId} materialId={card.materialId} tilt={null} opaque={forSnapshot}>
          <View style={styles.content} onLayout={onLayout}>
            <View style={[styles.rotated, rotated]}>
              {/* The Master QR — a snapshot of the whole card, not one link.
                  It encodes the URL of a rendered PNG of both faces; a
                  stock-camera scan lands the recipient on that image to
                  save. Suppressed until the first capture exists (and in
                  the snapshot render itself), so it's never a dead link. */}
              {showMasterQR ? (
                <>
                  <View style={styles.masterPlate}>
                    <QRCode
                      value={snapshotUrl as string}
                      size={masterSize}
                      color="#000000"
                      backgroundColor="#ffffff"
                    />
                  </View>

                  <ThemedText variant="label" style={[styles.scanLabel, { color: template.labelColor }]}>
                    SCAN TO SAVE
                  </ThemedText>
                </>
              ) : (
                editable &&
                !forSnapshot && (
                  <ThemedText
                    variant="caption"
                    style={[styles.masterPending, { color: template.labelColor }]}>
                    Your card code is generating — save your edits to update it.
                  </ThemedText>
                )
              )}

              <View style={[styles.rule, { backgroundColor: `${textColor}1A` }]} />

              <View style={styles.grid}>
                {gridCells.map((cell, index) => {
                  // Inner seams only: the right border stops at the last
                  // column, the bottom border at the last row.
                  const divider = {
                    borderRightWidth: index % GRID_COLUMNS === GRID_COLUMNS - 1 ? 0 : StyleSheet.hairlineWidth,
                    borderBottomWidth: index < GRID_COLUMNS ? StyleSheet.hairlineWidth : 0,
                    borderColor: `${textColor}26`,
                  };

                  if (cell === 'add') {
                    return (
                      <Pressable key="add" style={[styles.cell, divider]} onPress={onAddLink}>
                        <View
                          style={[
                            styles.addWell,
                            { borderColor: `${textColor}33`, width: glyphSize + Spacing.md, height: glyphSize + Spacing.md },
                          ]}>
                          <ThemedText style={[styles.addPlus, { color: textColor }]}>+</ThemedText>
                        </View>
                        <ThemedText variant="label" style={[styles.cellLabel, { color: template.labelColor }]}>
                          ADD
                        </ThemedText>
                      </Pressable>
                    );
                  }

                  // An empty quadrant still holds its share of the block, so
                  // the cross stays centred with fewer than four links.
                  if (!cell) return <View key={`empty-${index}`} style={[styles.cell, divider]} />;

                  return (
                    <Pressable
                      key={cell.id}
                      style={[styles.cell, divider, !cell.isActive && styles.cellInactive]}
                      onPress={() => handlePressLink(cell)}>
                      <LinkGlyph platform={cell.platform} size={glyphSize} color={textColor} />
                      <ThemedText
                        numberOfLines={1}
                        variant="label"
                        style={[styles.cellLabel, { color: template.labelColor }]}>
                        {cell.platform.toUpperCase()}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>

              {!editable && visibleLinks.length === 0 && (
                <ThemedText variant="caption" style={{ color: template.labelColor }}>
                  No links yet
                </ThemedText>
              )}
            </View>
          </View>
        </CardMaterial>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { flex: 1 },
  content: {
    flex: 1,
    // Centring the rotated box here keeps it independent of the frame's
    // aspect ratio; offsetting it by hand drifts once width != height.
    alignItems: 'center',
    justifyContent: 'center',
  },
  // The screen stays locked to landscape, so the back face is rotated a
  // quarter turn in place: the phone is turned upright to read it, and the
  // text runs along the card's long edge as it would on a real portrait card.
  rotated: {
    padding: Card.padding,
    alignItems: 'center',
    // Anchored to the top: the QR leads, and the rule + grid flow down
    // beneath it into the space that was previously dead centre padding.
    justifyContent: 'flex-start',
    gap: Spacing.sm,
    transform: [{ rotate: '-90deg' }],
  },
  scanLabel: {
    fontSize: 9,
    letterSpacing: 2.5,
    marginTop: Spacing.xxs,
  },
  // Holds roughly the Master QR's vertical space while the first capture is
  // pending, so the grid below doesn't jump when the code appears.
  masterPending: {
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  // A quiet zone of white around the code is what makes it scannable on a
  // dark or textured material.
  masterPlate: {
    padding: Spacing.sm,
    backgroundColor: '#ffffff',
    borderRadius: Spacing.xs,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: Spacing.xxs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'stretch',
  },
  cell: {
    width: `${100 / GRID_COLUMNS}%`,
    alignItems: 'center',
    justifyContent: 'center',
    // The cells carry the tile's breathing room themselves; with borders
    // between them, gap would break the cross into four detached strokes.
    paddingVertical: Spacing.sm,
    gap: Spacing.xxs,
  },
  cellInactive: {
    opacity: 0.35,
  },
  cellLabel: {
    fontSize: 9,
    letterSpacing: 1.2,
  },
  addWell: {
    borderWidth: 1,
    borderRadius: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlus: {
    fontSize: 16,
    lineHeight: 18,
  },
});
