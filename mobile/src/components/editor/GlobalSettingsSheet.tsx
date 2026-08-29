import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { EditorSheet } from '@/components/editor/EditorSheet';
import { FontColorPickerSheet } from '@/components/editor/FontColorPickerSheet';
import { FontSheet } from '@/components/editor/FontSheet';
import { MaterialsSheet } from '@/components/editor/MaterialsSheet';
import { ThemedText } from '@/components/themed-text';
import { CARD_TEMPLATES } from '@/constants/cardTemplates';
import { FONT_COLOR_LIST } from '@/constants/fontColors';
import { getCardFont } from '@/constants/fonts';
import { getCardMaterial } from '@/constants/materials';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCardStore } from '@/store/useCardStore';
import type { CardTemplateId } from '@/types/card';

interface GlobalSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

// CARD_TEMPLATES is a Record, so entries() doesn't preserve a guaranteed
// display order across engines -- list ids explicitly (Classic, Creative,
// Dev, matching EDITOR_SPEC.md's order) instead of relying on object order.
const TEMPLATE_ORDER: CardTemplateId[] = ['pierceAndPierce', 'creative', 'dev'];

export function GlobalSettingsSheet({ visible, onClose }: GlobalSettingsSheetProps) {
  const materialId = useCardStore((state) => state.card.materialId);
  const templateId = useCardStore((state) => state.card.templateId);
  const setTemplate = useCardStore((state) => state.setTemplate);
  const fontId = useCardStore((state) => state.card.fontId);
  const fontColorId = useCardStore((state) => state.card.fontColorId);
  const fontColorHex = useCardStore((state) => state.card.fontColorHex);
  const setFontColor = useCardStore((state) => state.setFontColor);
  const theme = useTheme();

  // Material and Font each get their own nested sheet -- this sheet only
  // holds the row that opens each, so they can sit side by side.
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [fontOpen, setFontOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const currentMaterial = getCardMaterial(materialId);

  return (
    <>
    <EditorSheet title="Card Style" visible={visible} onClose={onClose}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
        Layout
      </ThemedText>
      <View style={styles.row}>
        {TEMPLATE_ORDER.map((id) => (
          <Pressable
            key={id}
            style={[
              styles.swatch,
              { borderColor: theme.hairline },
              templateId === id && { borderColor: theme.text, borderWidth: 2 },
            ]}
            onPress={() => setTemplate(id)}>
            <ThemedText type="small">{CARD_TEMPLATES[id].name}</ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={styles.pairRow}>
        <View style={styles.pairCol}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            Material
          </ThemedText>
          <Pressable
            style={[styles.dropdown, { borderColor: theme.hairline }]}
            onPress={() => setMaterialsOpen(true)}>
            <ThemedText type="small" numberOfLines={1}>
              {currentMaterial.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              ›
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.pairCol}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            Font
          </ThemedText>
          <Pressable
            style={[styles.dropdown, { borderColor: theme.hairline }]}
            onPress={() => setFontOpen(true)}>
            <ThemedText type="small" numberOfLines={1}>
              {fontId ? getCardFont(fontId).name : 'Default'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              ›
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
        Font Color
      </ThemedText>
      <View style={styles.row}>
        {/* Default has no colour to fill -- a hairline chip with a slash. */}
        <Pressable
          style={[
            styles.colorChip,
            styles.defaultChip,
            { borderColor: theme.hairline },
            !fontColorId && { borderColor: theme.text, borderWidth: 2 },
          ]}
          onPress={() => setFontColor(undefined)}>
          <View style={[styles.defaultSlash, { backgroundColor: theme.hairline }]} />
        </Pressable>
        {FONT_COLOR_LIST.map((color) => (
          <Pressable
            key={color.id}
            style={[
              styles.colorChip,
              { backgroundColor: color.textColor, borderColor: theme.hairline },
              fontColorId === color.id && { borderColor: theme.text, borderWidth: 2 },
            ]}
            onPress={() => setFontColor(color.id)}
            accessibilityLabel={color.name}
          />
        ))}
        {/* Custom hex -- shows the chosen colour when set, a '+' otherwise. */}
        <Pressable
          style={[
            styles.colorChip,
            styles.defaultChip,
            { borderColor: theme.hairline },
            fontColorHex
              ? { backgroundColor: fontColorHex }
              : null,
            fontColorHex && { borderColor: theme.text, borderWidth: 2 },
          ]}
          onPress={() => setColorPickerOpen(true)}
          accessibilityLabel="Custom color">
          {!fontColorHex && (
            <ThemedText type="small" themeColor="textSecondary">
              +
            </ThemedText>
          )}
        </Pressable>
      </View>
    </EditorSheet>
    <MaterialsSheet visible={materialsOpen} onClose={() => setMaterialsOpen(false)} />
    <FontSheet visible={fontOpen} onClose={() => setFontOpen(false)} />
    <FontColorPickerSheet visible={colorPickerOpen} onClose={() => setColorPickerOpen(false)} />
    </>
  );
}

const CHIP_SIZE = 40;

const styles = StyleSheet.create({
  sectionLabel: {
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  swatch: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.sm,
    borderWidth: 1,
  },
  pairRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  pairCol: {
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.sm,
    borderWidth: 1,
  },
  colorChip: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    borderRadius: Spacing.sm,
    borderWidth: 1,
  },
  defaultChip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultSlash: {
    width: CHIP_SIZE - 12,
    height: 2,
    transform: [{ rotate: '-45deg' }],
  },
});
