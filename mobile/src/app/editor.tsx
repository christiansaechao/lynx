import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCardSnapshot } from '@/hooks/useCardSnapshot';
import { useOrientationLock } from '@/hooks/use-orientation-lock';
import { useKeyboardOffset } from '@/hooks/use-keyboard-offset';
import { CardFlipContainer } from '@/components/CardFlipContainer';
import { CardSnapshotComposite } from '@/components/CardSnapshotComposite';
import { ThemedText } from '@/components/themed-text';
import { EDITOR_ACCESSORY_VIEW_ID, getActiveEditorLayout } from '@/constants/editorLayout';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { EditableFieldKey } from '@/types/card';

// How far the content shifts up when the keyboard appears -- a fixed amount
// rather than the full keyboard height, since the accessory bar (docked to
// the keyboard) is what actually needs the field visible above it, not the
// whole keyboard. Capping this keeps the card from being pushed further
// than necessary. Tune here if a field is still covered on smaller devices.
const KEYBOARD_SHIFT = 160;

// Resolved once at module scope, same as any other constant-driven config --
// swapping ACTIVE_EDITOR_LAYOUT and reloading is how versions are compared.
const ActiveEditorLayout = getActiveEditorLayout();

export default function EditorScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  // The editor opens on whichever face the user was looking at when they
  // reached for a control, so tapping the cog on the back doesn't silently
  // flip the card to the front.
  const { face } = useLocalSearchParams<{ face?: string }>();
  const initialFace = face === 'back' ? 'back' : 'front';

  const [selectedField, setSelectedField] = useState<EditableFieldKey | null>(null);
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false);
  const [addLinkOpen, setAddLinkOpen] = useState(false);

  useOrientationLock(ScreenOrientation.OrientationLock.LANDSCAPE);

  const translateY = useKeyboardOffset(KEYBOARD_SHIFT);

  // Re-render the Master QR's target image (front + back PNG) as the card is
  // edited here. Debounced inside the hook, which also decides *when* the
  // (expensive, 3x-scale) composite is mounted -- only for the capture
  // window, never during an edit -- so a swatch tap isn't stalled by it.
  const { snapshotRef, shouldMount: mountSnapshot } = useCardSnapshot();

  return (
    <View style={styles.flex}>
      <Animated.View
        style={[
          styles.safeArea,
          {
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.lg,
            paddingLeft: insets.left + Spacing.lg,
            paddingRight: insets.right + Spacing.lg,
            transform: [{ translateY }],
          },
        ]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.headerButton}>
            <ThemedText variant="button">Done</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setGlobalSettingsOpen(true)}
            hitSlop={16}
            style={styles.headerButton}>
            <SymbolView name="gearshape" size={20} tintColor={theme.text} />
          </Pressable>
        </View>

        <View style={styles.cardWrap}>
          <CardFlipContainer
            mode="edit"
            initialFace={initialFace}
            onSelectField={setSelectedField}
            onAddLink={() => setAddLinkOpen(true)}
            inputAccessoryViewID={EDITOR_ACCESSORY_VIEW_ID}
          />
        </View>

        <ActiveEditorLayout
          selectedField={selectedField}
          onCloseFieldSettings={() => setSelectedField(null)}
          globalSettingsOpen={globalSettingsOpen}
          onCloseGlobalSettings={() => setGlobalSettingsOpen(false)}
          addLinkOpen={addLinkOpen}
          onCloseAddLink={() => setAddLinkOpen(false)}
        />
      </Animated.View>

      {mountSnapshot && <CardSnapshotComposite ref={snapshotRef} />}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  // Padding widens the visible press area; the Pressables also carry
  // hitSlop for the gap between the small icon/label and this box. The
  // negative margin keeps the row's visual alignment unchanged.
  headerButton: {
    padding: Spacing.sm,
    margin: -Spacing.sm,
  },
  cardWrap: {
    flex: 1,
  },
});
