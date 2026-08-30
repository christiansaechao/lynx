import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { CardMaterial, useCardTemplateStyle } from '@/components/CardMaterial';
import { ThemedText } from '@/components/themed-text';
import { Card, Spacing } from '@/constants/theme';
import { useCardStore } from '@/store/useCardStore';
import type { Link } from '@/types/card';

/**
 * The back page of the Master-QR snapshot PNG (see cardSnapshot.ts). This
 * is NOT the in-app card back -- that one (CardBack.tsx) is an interactive
 * sharing hub whose own Master QR would recursively bake a stale copy of
 * itself into the image. Instead, the saved back page is a utilitarian
 * "contact sheet": a 2x2 grid of individually scannable QR codes, one per
 * active link, each carrying that link's real URL.
 *
 * Design decisions (docs/PRODUCT_REQUIREMENTS.md item 2, and the QR-sheet
 * discussion):
 *  - Pure black on white with a generous quiet-zone plate, ecl 'Q' -- the
 *    cross-platform fallback is a recruiter scanning these off their own
 *    phone screen at arm's length, which has to work with no OS "tap the
 *    QR in a screenshot" feature (iOS has it, Android mostly doesn't).
 *  - Capped at 4 (SNAPSHOT_LINK_CAP). More active links get a "+N more"
 *    footer rather than a third page, keeping CardSnapshotComposite a
 *    clean equal-height 2-face stack and the capture cheap.
 *  - Platform name only under each code; the QR itself carries the URL.
 *
 * Rendered only inside CardSnapshotComposite, offscreen, non-interactive.
 */

export const SNAPSHOT_LINK_CAP = 4;

export function CardSnapshotBack() {
  const card = useCardStore((state) => state.card);
  const template = useCardTemplateStyle(card.templateId, card.materialId);
  const { textColor, labelColor } = template;

  const activeLinks = card.links.filter((link) => link.isActive);
  const shownLinks = activeLinks.slice(0, SNAPSHOT_LINK_CAP);
  const overflow = activeLinks.length - shownLinks.length;

  const name = card.fields.fullName;

  return (
    <CardMaterial templateId={card.templateId} materialId={card.materialId} tilt={null} opaque>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="label" style={[styles.kicker, { color: labelColor }]}>
            Scan a link
          </ThemedText>
          {!!name && (
            <ThemedText style={[styles.name, { color: textColor }]} numberOfLines={1}>
              {name}
            </ThemedText>
          )}
        </View>

        {shownLinks.length > 0 ? (
          <View style={styles.grid}>
            {shownLinks.map((link) => (
              <QrCell key={link.id} link={link} labelColor={labelColor} />
            ))}
          </View>
        ) : (
          <ThemedText variant="caption" style={[styles.empty, { color: labelColor }]}>
            No links yet
          </ThemedText>
        )}

        {overflow > 0 && (
          <ThemedText variant="caption" style={[styles.footer, { color: labelColor }]}>
            +{overflow} more in the Lynx app
          </ThemedText>
        )}
      </View>
    </CardMaterial>
  );
}

const QR_SIZE = 210;

function QrCell({ link, labelColor }: { link: Link; labelColor: string }) {
  return (
    <View style={styles.cell}>
      {/* A white quiet zone around the code is what keeps it scannable on
          a dark or textured material, and off a phone screen. */}
      <View style={styles.plate}>
        <QRCode value={link.url} size={QR_SIZE} ecl="Q" color="#000000" backgroundColor="#ffffff" />
      </View>
      <ThemedText variant="label" numberOfLines={1} style={[styles.cellLabel, { color: labelColor }]}>
        {link.platform.toUpperCase()}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: Card.padding,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  kicker: {
    fontSize: 9,
    letterSpacing: 2.5,
  },
  name: {
    fontSize: 18,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  cell: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  plate: {
    padding: Spacing.sm,
    backgroundColor: '#ffffff',
    borderRadius: Spacing.xs,
  },
  cellLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
  },
  empty: {
    paddingVertical: Spacing.xl,
  },
  footer: {
    marginTop: Spacing.xs,
  },
});
