import Slider from '@react-native-community/slider';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { EditorSheet } from '@/components/editor/EditorSheet';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCardStore } from '@/store/useCardStore';
import type { EditableFieldKey } from '@/types/card';

interface ElementSettingsSheetProps {
  selectedField: EditableFieldKey | null;
  onClose: () => void;
}

// Additive to the template's base letter-spacing (see cardTemplates.ts,
// where nameLetterSpacing/labelLetterSpacing sit in roughly this range) --
// wide enough to feel like a real adjustment without producing illegible
// spacing on a card-sized surface.
const KERNING_MIN = -1;
const KERNING_MAX = 4;
const KERNING_STEP = 0.25;

const STYLE_TOGGLES: { key: 'bold' | 'italic' | 'allCaps'; label: string }[] = [
  { key: 'bold', label: 'Bold' },
  { key: 'italic', label: 'Italic' },
  { key: 'allCaps', label: 'All Caps' },
];

/**
 * Element-specific settings per EDITOR_SPEC.md: visibility, font weight/
 * style, and kerning for whichever field was last tapped on the card.
 */
export function ElementSettingsSheet({ selectedField, onClose }: ElementSettingsSheetProps) {
  const theme = useTheme();
  const fieldStyle = useCardStore((state) => (selectedField ? state.card.fieldStyles[selectedField] : undefined));
  const setFieldStyle = useCardStore((state) => state.setFieldStyle);

  // Falls back to a stable field so the sheet's exit animation (which keeps
  // it mounted one frame after selectedField clears -- see EditorSheet) has
  // something non-null to render instead of crashing on a null key.
  const field = selectedField ?? 'fullName';

  const kerning = fieldStyle?.kerning ?? 0;

  return (
    <EditorSheet title={selectedField ? `Editing: ${selectedField}` : ''} visible={!!selectedField} onClose={onClose}>
      <View style={styles.row}>
        <ThemedText type="small">Show this field</ThemedText>
        <Switch
          value={!fieldStyle?.hidden}
          onValueChange={(shown) => setFieldStyle(field, { hidden: !shown })}
        />
      </View>

      <View style={styles.togglesRow}>
        {STYLE_TOGGLES.map(({ key, label }) => {
          const active = !!fieldStyle?.[key];
          return (
            <Pressable
              key={key}
              style={[
                styles.toggle,
                { borderColor: theme.hairline },
                active && { borderColor: theme.text, borderWidth: 2 },
              ]}
              onPress={() => setFieldStyle(field, { [key]: !active })}>
              <ThemedText type="small">{label}</ThemedText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.kerningBlock}>
        <View style={styles.row}>
          <ThemedText type="small">Kerning</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {kerning > 0 ? `+${kerning.toFixed(2)}` : kerning.toFixed(2)}
          </ThemedText>
        </View>
        <Slider
          minimumValue={KERNING_MIN}
          maximumValue={KERNING_MAX}
          step={KERNING_STEP}
          value={kerning}
          onValueChange={(value) => setFieldStyle(field, { kerning: value })}
          minimumTrackTintColor={theme.text}
          maximumTrackTintColor={theme.hairline}
        />
      </View>
    </EditorSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  togglesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  toggle: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.sm,
    borderWidth: 1,
  },
  kerningBlock: {
    marginTop: Spacing.md,
    // Leaves room to be the last visible control before the sheet's bottom
    // safe-area padding takes over, rather than the slider's thumb sitting
    // flush against it.
    paddingBottom: Spacing.sm,
  },
});
