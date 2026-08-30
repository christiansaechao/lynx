import { StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { CardMaterial, useCardTemplateStyle } from '@/components/CardMaterial';
import { ThemedText } from '@/components/themed-text';
import { Card, Spacing } from '@/constants/theme';
import type { ContactCard } from '@/types/card';

interface ContactTileProps {
  contact: ContactCard;
  /** Compact = a small square-ish avatar chip for list rows; default is the full card-ratio tile for the grid. */
  variant?: 'grid' | 'compact';
}

function topLabel(contact: ContactCard): string {
  return contact.fields.context === 'employed' ? contact.fields.companyName : contact.fields.headline;
}

function roleLine(contact: ContactCard): string {
  return contact.fields.context === 'employed' ? contact.fields.jobTitle : contact.fields.targetRole;
}

/**
 * Renders a collected contact in its own material — "each preserved in its
 * original high-fidelity design" per docs/mockup-batches/BATCH_4. Reuses
 * CardMaterial exactly as CardBack does: tilt={null} for a flat, static
 * sheen rather than a gyroscope-driven one.
 */
export function ContactTile({ contact, variant = 'grid' }: ContactTileProps) {
  const template = useCardTemplateStyle(contact.templateId, contact.materialId);

  if (variant === 'compact') {
    return (
      <View style={styles.compactWrap}>
        <CardMaterial templateId={contact.templateId} materialId={contact.materialId} tilt={null} />
      </View>
    );
  }

  return (
    <View style={styles.gridWrap}>
      <CardMaterial templateId={contact.templateId} materialId={contact.materialId} tilt={null}>
        <View style={styles.content}>
          {contact.starred && (
            <View style={styles.star}>
              <SymbolView name="star.fill" size={12} tintColor={template.textColor} />
            </View>
          )}
          <ThemedText
            variant="label"
            numberOfLines={1}
            style={{ color: template.labelColor, fontSize: 8, letterSpacing: 2 }}>
            {topLabel(contact)}
          </ThemedText>
          <View>
            <ThemedText font="serif" numberOfLines={1} style={{ color: template.textColor, fontSize: 15 }}>
              {contact.fields.fullName}
            </ThemedText>
            <ThemedText numberOfLines={1} style={{ color: template.labelColor, fontSize: 9, marginTop: 2 }}>
              {roleLine(contact)}
            </ThemedText>
          </View>
        </View>
      </CardMaterial>
    </View>
  );
}

const styles = StyleSheet.create({
  gridWrap: {
    aspectRatio: Card.aspectRatio,
    borderRadius: 13,
    overflow: 'hidden',
  },
  compactWrap: {
    width: 44,
    aspectRatio: Card.aspectRatio,
    borderRadius: 4,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: Spacing.sm + Spacing.xxs,
    justifyContent: 'space-between',
  },
  star: {
    position: 'absolute',
    top: Spacing.xs + Spacing.xxs,
    right: Spacing.xs + Spacing.xxs,
    opacity: 0.85,
  },
});
