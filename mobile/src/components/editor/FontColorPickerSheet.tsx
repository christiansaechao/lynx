import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { runOnJS } from 'react-native-reanimated';
import ColorPicker, { HueSlider, Panel1 } from 'reanimated-color-picker';

import { EditorSheet } from '@/components/editor/EditorSheet';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCardStore } from '@/store/useCardStore';
import { normalizeHex } from '@/utils/color';

interface FontColorPickerSheetProps {
  visible: boolean;
  onClose: () => void;
}

const DEFAULT_COLOR = '#1c1a14'; // 'Ink' -- the seed when no custom hex is set yet
const MIN_PANEL = 120;

/**
 * Custom Font Color: a saturation/brightness panel + hue slider. The
 * preset inks live on the Global Settings sheet, not here. Opacity is
 * deliberately not offered -- there is no OpacitySlider and any alpha the
 * library reports is dropped by normalizeHex. Applying writes
 * card.fontColorHex, which clears any selected preset (see
 * useCardStore.setFontColorHex).
 */
export function FontColorPickerSheet({ visible, onClose }: FontColorPickerSheetProps) {
  const fontColorHex = useCardStore((state) => state.card.fontColorHex);
  const setFontColorHex = useCardStore((state) => state.setFontColorHex);
  const theme = useTheme();

  // The live selection. Seeded from the card's current custom hex (or Ink)
  // each time the sheet opens; ColorPicker is uncontrolled after that and
  // reports back through onComplete.
  const [selected, setSelected] = useState(fontColorHex ?? DEFAULT_COLOR);
  useEffect(() => {
    if (visible) setSelected(fontColorHex ?? DEFAULT_COLOR);
  }, [visible, fontColorHex]);

  // Panel1 / HueSlider need an explicit width -- inside the sheet's
  // ScrollView the cross-axis width is unconstrained and they collapse to
  // a sliver.
  const { width: windowWidth } = useWindowDimensions();
  const pickerWidth = Math.min(windowWidth - Spacing.lg * 4, 680);
  const HUE_WIDTH = 28;
  const SIDEBAR = 96;
  const panelWidth = pickerWidth - HUE_WIDTH - SIDEBAR - Spacing.md * 2;

  // ...and they also need an explicit HEIGHT (Panel1 hardcodes height:200
  // otherwise and ignores flex), so we measure the row's own laid-out
  // height and feed that back in. `fillHeight` on EditorSheet pins the
  // sheet at its cap, so this measurement is the real available space and
  // the picker fills it exactly -- no scroll, no cut-off.
  const [rowHeight, setRowHeight] = useState(0);
  const onRowLayout = (e: LayoutChangeEvent) => {
    const h = Math.floor(e.nativeEvent.layout.height);
    if (h > 0 && h !== rowHeight) setRowHeight(h);
  };
  const panelHeight = Math.max(MIN_PANEL, rowHeight);

  const handleApply = () => {
    const normalized = normalizeHex(selected);
    if (!normalized) return;
    setFontColorHex(normalized);
    onClose();
  };

  return (
    <EditorSheet title="Custom Color" visible={visible} onClose={onClose} fillHeight>
      <ColorPicker
        value={selected}
        // `onComplete` is a UI-thread worklet. We read `.hex` (an 8-digit
        // #rrggbbaa string) *inside* the worklet -- the ColorFormatsObject
        // is built from lazy getters that do not survive being marshalled
        // straight through runOnJS, so `onChangeJS={({hex}) => ...}` hands
        // back `undefined`. Pulling the primitive out first, then
        // runOnJS-ing the plain string, is what actually updates state.
        // Fires on gesture end; the card store is only touched on Apply.
        onComplete={(colors) => {
          'worklet';
          const hex = colors.hex;
          runOnJS(setSelected)(hex);
        }}
        style={[styles.picker, { width: pickerWidth }]}>
        <View style={styles.pickerRow} onLayout={onRowLayout}>
          <Panel1 style={[styles.panel, { width: panelWidth, height: panelHeight }]} />
          <HueSlider
            vertical
            style={[styles.slider, { width: HUE_WIDTH, height: panelHeight }]}
          />
          <View style={[styles.sidebar, { width: SIDEBAR }]}>
            <View style={styles.readout}>
              <View style={[styles.chip, { backgroundColor: selected, borderColor: theme.hairline }]} />
              <ThemedText variant="label" style={{ color: theme.text }}>
                {normalizeHex(selected) ?? selected}
              </ThemedText>
            </View>
            <Pressable
              onPress={handleApply}
              hitSlop={Spacing.sm}
              style={[styles.applyBtn, { backgroundColor: theme.backgroundSelected, borderColor: theme.text }]}>
              <ThemedText variant="button">Apply</ThemedText>
            </Pressable>
          </View>
        </View>
      </ColorPicker>
    </EditorSheet>
  );
}

const styles = StyleSheet.create({
  picker: {
    flex: 1,
  },
  pickerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.md,
  },
  panel: {
    borderRadius: Spacing.sm,
  },
  slider: {
    borderRadius: Spacing.sm,
  },
  sidebar: {
    justifyContent: 'center',
    gap: Spacing.md,
  },
  readout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chip: {
    width: 28,
    height: 28,
    borderRadius: Spacing.sm,
    borderWidth: 1,
  },
  applyBtn: {
    paddingVertical: Spacing.sm + Spacing.xxs,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
});
