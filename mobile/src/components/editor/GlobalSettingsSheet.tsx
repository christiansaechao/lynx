import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { EditorSheet } from '@/components/editor/EditorSheet';
import { MaterialsSheet } from '@/components/editor/MaterialsSheet';
import { ThemedText } from '@/components/themed-text';
import { CARD_TEMPLATES } from '@/constants/cardTemplates';
import { FONT_COLOR_LIST } from '@/constants/fontColors';
import { FONT_LIST } from '@/constants/fonts';
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
  const setFont = useCardStore((state) => state.setFont);
  const fontColorId = useCardStore((state) => state.card.fontColorId);
  const setFontColor = useCardStore((state) => state.setFontColor);
  const theme = useTheme();

  // Materials get their own sheet -- they're the cosmetic economy, not just
  // another chip row -- so this sheet only holds a row that opens it.
  const [materialsOpen, setMaterialsOpen] = useState(false);
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

      <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
        Material
      </ThemedText>
      <Pressable
        style={[styles.linkRow, { borderColor: theme.hairline }]}
        onPress={() => setMaterialsOpen(true)}>
        <ThemedText type="small">{currentMaterial.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {currentMaterial.collection} ›
        </ThemedText>
      </Pressable>

      <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
        Font
      </ThemedText>
      <View style={styles.row}>
        {/* No selection (fontId undefined) means "use the template's own font" -- offered as its own chip rather than defaulting one of the four to always look selected. */}
        <Pressable
          style={[styles.swatch, { borderColor: theme.hairline }, !fontId && { borderColor: theme.text, borderWidth: 2 }]}
          onPress={() => setFont(undefined)}>
          <ThemedText type="small">Default</ThemedText>
        </Pressable>
        {FONT_LIST.map((font) => (
          <Pressable
            key={font.id}
            style={[
              styles.swatch,
              { borderColor: theme.hairline },
              fontId === font.id && { borderColor: theme.text, borderWidth: 2 },
            ]}
            onPress={() => setFont(font.id)}>
            <ThemedText type="small">{font.name}</ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
        Font Color
      </ThemedText>
      <View style={styles.row}>
        <Pressable
          style={[
            styles.swatch,
            { borderColor: theme.hairline },
            !fontColorId && { borderColor: theme.text, borderWidth: 2 },
          ]}
          onPress={() => setFontColor(undefined)}>
          <ThemedText type="small">Default</ThemedText>
        </Pressable>
        {FONT_COLOR_LIST.map((color) => (
          <Pressable
            key={color.id}
            style={[
              styles.swatch,
              styles.colorSwatch,
              { borderColor: theme.hairline },
              fontColorId === color.id && { borderColor: theme.text, borderWidth: 2 },
            ]}
            onPress={() => setFontColor(color.id)}>
            <View style={[styles.colorDot, { backgroundColor: color.textColor }]} />
            <ThemedText type="small">{color.name}</ThemedText>
          </Pressable>
        ))}
      </View>
    </EditorSheet>
    <MaterialsSheet visible={materialsOpen} onClose={() => setMaterialsOpen(false)} />
    </>
  );
}

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
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  colorSwatch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
