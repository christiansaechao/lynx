import { Pressable, StyleSheet, View } from 'react-native';

import { EditorSheet } from '@/components/editor/EditorSheet';
import { ThemedText } from '@/components/themed-text';
import { FONT_LIST } from '@/constants/fonts';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCardStore } from '@/store/useCardStore';

interface FontSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * The Fonts axis as its own nested sheet, mirroring MaterialsSheet -- the
 * Card Style sheet only holds a row that opens this, so Material and Font
 * can sit side by side there instead of each taking a full-width chip row.
 */
export function FontSheet({ visible, onClose }: FontSheetProps) {
  const fontId = useCardStore((state) => state.card.fontId);
  const setFont = useCardStore((state) => state.setFont);
  const fullName = useCardStore((state) => state.card.fields.fullName);
  const theme = useTheme();

  // Preview the card owner's own name in each font -- more useful than an
  // abstract pangram, and it's what actually shows on the card.
  const sample = fullName || 'Your Name';

  const select = (id: Parameters<typeof setFont>[0]) => {
    setFont(id);
    onClose();
  };

  return (
    <EditorSheet title="Font" visible={visible} onClose={onClose}>
      <View style={styles.list}>
        {/* No selection (fontId undefined) = "use the template's own font". */}
        <Pressable
          style={[styles.row, { borderColor: theme.hairline }, !fontId && { borderColor: theme.text, borderWidth: 2 }]}
          onPress={() => select(undefined)}>
          <ThemedText type="small">Default</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Template font
          </ThemedText>
        </Pressable>
        {FONT_LIST.map((font) => (
          <Pressable
            key={font.id}
            style={[
              styles.row,
              { borderColor: theme.hairline },
              fontId === font.id && { borderColor: theme.text, borderWidth: 2 },
            ]}
            onPress={() => select(font.id)}>
            <View style={styles.rowLeft}>
              <ThemedText type="small" themeColor="textSecondary">
                {font.name}
              </ThemedText>
              {/* The card owner's name, set in the font -- these are iOS
                  system descriptors, already loaded, so a live sample is
                  free. */}
              <ThemedText
                type="default"
                numberOfLines={1}
                style={{ fontFamily: Fonts?.[font.id] }}>
                {sample}
              </ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {font.tier === 'premium' ? 'Premium' : 'Free'}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </EditorSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.sm,
    borderWidth: 1,
  },
  rowLeft: {
    flex: 1,
    gap: Spacing.xxs,
  },
});
