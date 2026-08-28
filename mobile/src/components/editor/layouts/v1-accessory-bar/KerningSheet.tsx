import Slider from '@react-native-community/slider';
import { View } from 'react-native';

import { EditorSheet } from '@/components/editor/EditorSheet';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCardStore } from '@/store/useCardStore';
import type { EditableFieldKey } from '@/types/card';

// Same range as the original single-sheet version -- additive to the
// template's base letter-spacing (see cardTemplates.ts).
const KERNING_MIN = -1;
const KERNING_MAX = 4;
const KERNING_STEP = 0.25;

interface KerningSheetProps {
  field: EditableFieldKey | null;
  onClose: () => void;
}

/**
 * The one control from EDITOR_SPEC.md's "Element-Specific Settings" that
 * needs more room than the accessory bar's icon row -- everything else
 * (bold/italic/all-caps/visibility) lives in AccessoryBar instead. Reuses
 * EditorSheet so it matches GlobalSettingsSheet/AddLinkSheet visually.
 */
export function KerningSheet({ field, onClose }: KerningSheetProps) {
  const theme = useTheme();
  const kerning = useCardStore((state) => (field ? state.card.fieldStyles[field]?.kerning ?? 0 : 0));
  const setFieldStyle = useCardStore((state) => state.setFieldStyle);

  return (
    <EditorSheet title={field ? `Spacing — ${field}` : ''} visible={!!field} onClose={onClose}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
        <ThemedText type="small">Letter spacing</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {kerning > 0 ? `+${kerning.toFixed(2)}` : kerning.toFixed(2)}
        </ThemedText>
      </View>
      <Slider
        minimumValue={KERNING_MIN}
        maximumValue={KERNING_MAX}
        step={KERNING_STEP}
        value={kerning}
        onValueChange={(value) => field && setFieldStyle(field, { kerning: value })}
        minimumTrackTintColor={theme.text}
        maximumTrackTintColor={theme.hairline}
      />
    </EditorSheet>
  );
}
