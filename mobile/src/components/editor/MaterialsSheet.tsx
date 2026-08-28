import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { EditorSheet } from '@/components/editor/EditorSheet';
import { ThemedText } from '@/components/themed-text';
import { CARD_MATERIALS } from '@/constants/materials';
import { Card, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCardStore } from '@/store/useCardStore';
import type { CardMaterial } from '@/constants/materials';

interface MaterialsSheetProps {
  visible: boolean;
  onClose: () => void;
}

// CARD_MATERIALS is a Record, so its key order isn't a guaranteed display
// order across engines. List the collections explicitly, in the catalog's
// order (MATERIALS_CATALOG.md / BATCH_6_materials.md), and pull each
// collection's members in declared order.
const COLLECTION_ORDER: CardMaterial['collection'][] = [
  'Classics',
  'Modern Executives',
  'Creatives & Techies',
  'Avant-Garde',
];

const MATERIALS_BY_COLLECTION = COLLECTION_ORDER.map((collection) => ({
  collection,
  materials: Object.values(CARD_MATERIALS).filter((m) => m.collection === collection),
}));

export function MaterialsSheet({ visible, onClose }: MaterialsSheetProps) {
  const materialId = useCardStore((state) => state.card.materialId);
  const setMaterial = useCardStore((state) => state.setMaterial);
  const theme = useTheme();

  return (
    <EditorSheet title="Material" visible={visible} onClose={onClose}>
      {MATERIALS_BY_COLLECTION.map(({ collection, materials }) => {
        // A collection is premium if every material in it is -- Classics is
        // the only all-free group, so this reads as "the paid collections".
        const isPremium = materials.every((m) => m.tier === 'premium');
        return (
          <View key={collection} style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
                {collection}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
                {isPremium ? 'Premium' : 'Free'}
              </ThemedText>
            </View>
            <View style={styles.grid}>
              {materials.map((material) => {
                const selected = materialId === material.id;
                return (
                  <Pressable
                    key={material.id}
                    onPress={() => setMaterial(material.id)}
                    style={[
                      styles.swatch,
                      { borderColor: theme.hairline },
                      selected && { borderColor: theme.text, borderWidth: 2 },
                    ]}>
                    <LinearGradient
                      colors={material.background.colors}
                      start={material.background.start}
                      end={material.background.end}
                      style={styles.swatchPreview}>
                      <ThemedText
                        numberOfLines={1}
                        style={[styles.swatchName, { color: material.textColor }]}>
                        {material.name}
                      </ThemedText>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </EditorSheet>
  );
}

const SWATCH_WIDTH = 150;

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  swatch: {
    width: SWATCH_WIDTH,
    borderRadius: Spacing.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  swatchPreview: {
    // Business-card ratio (1.75:1 landscape), matching the real card face.
    width: '100%',
    aspectRatio: Card.aspectRatio,
    padding: Spacing.sm,
    justifyContent: 'flex-end',
  },
  swatchName: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
