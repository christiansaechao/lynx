import { Keyboard, InputAccessoryView, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EDITOR_ACCESSORY_VIEW_ID } from '@/constants/editorLayout';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCardStore } from '@/store/useCardStore';
import type { EditableFieldKey } from '@/types/card';

interface AccessoryBarProps {
  field: EditableFieldKey | null;
  /** Dismisses the keyboard and opens the Kerning sheet for `field`. */
  onOpenKerning: () => void;
}

// Every field key CardFront can render, across both card contexts (see
// EditableFieldKey / EmployedCardFields / JobSeekerCardFields in
// src/types/card.ts). Only ~6 of these are mounted as TextInputs at once
// depending on context, but listing the full union here is simpler and
// safer than threading context down just to trim it -- an unused
// InputAccessoryView costs nothing.
const ALL_FIELD_KEYS: EditableFieldKey[] = [
  'companyName',
  'headline',
  'fullName',
  'jobTitle',
  'targetRole',
  'department',
  'education',
  'location',
  'phone',
  'email',
];

/**
 * The bar itself, shared between the iOS InputAccessoryView wrapper below
 * and the Android inline fallback (see AccessoryBarHost) -- Android has no
 * InputAccessoryView equivalent, so there it renders inline above the card
 * instead of docked to the keyboard.
 */
function AccessoryBarContent({ field, onOpenKerning }: AccessoryBarProps) {
  const theme = useTheme();
  const fieldStyle = useCardStore((state) => (field ? state.card.fieldStyles[field] : undefined));
  const setFieldStyle = useCardStore((state) => state.setFieldStyle);

  // Nothing focused yet -- render an empty (but already-mounted) bar so iOS
  // has an InputAccessoryView to attach when focus lands. See the mounting
  // note on AccessoryBarHost below for why this can't just be `return null`.
  if (!field) {
    return <View style={[styles.bar, { backgroundColor: theme.backgroundElement, borderColor: theme.hairline }]} />;
  }

  const iconButton = (label: string, active: boolean, onPress: () => void) => (
    <Pressable
      onPress={onPress}
      style={[styles.button, active && { backgroundColor: theme.text }]}
      hitSlop={Spacing.xs}>
      <ThemedText type="small" style={active ? { color: theme.background } : undefined}>
        {label}
      </ThemedText>
    </Pressable>
  );

  return (
    <View style={[styles.bar, { backgroundColor: theme.backgroundElement, borderColor: theme.hairline }]}>
      {iconButton('B', !!fieldStyle?.bold, () => setFieldStyle(field, { bold: !fieldStyle?.bold }))}
      {iconButton('I', !!fieldStyle?.italic, () => setFieldStyle(field, { italic: !fieldStyle?.italic }))}
      {iconButton('AA', !!fieldStyle?.allCaps, () => setFieldStyle(field, { allCaps: !fieldStyle?.allCaps }))}

      <View style={styles.divider} />

      <Pressable onPress={onOpenKerning} style={styles.button} hitSlop={Spacing.xs}>
        <ThemedText type="small">Spacing</ThemedText>
      </Pressable>

      <View style={styles.spacer} />

      <View style={styles.visibilityRow}>
        <ThemedText type="small" themeColor="textSecondary">
          Show
        </ThemedText>
        <Switch
          value={!fieldStyle?.hidden}
          onValueChange={(shown) => setFieldStyle(field, { hidden: !shown })}
        />
      </View>
    </View>
  );
}

/**
 * Docks AccessoryBarContent to the top edge of the keyboard on iOS.
 *
 * Renders one InputAccessoryView per field key (see ALL_FIELD_KEYS), all
 * mounted unconditionally for the lifetime of the editor screen, rather
 * than a single shared one. Two RN quirks force this:
 *
 * 1. iOS only attaches an InputAccessoryView to a TextInput if the view
 *    already exists in the tree at the moment the TextInput becomes first
 *    responder -- gating the view on `field` (which itself only becomes
 *    non-null from the TextInput's own onFocus) is always one render late.
 * 2. A single inputAccessoryViewID shared across multiple TextInputs only
 *    docks for whichever field is focused *first* -- every other field
 *    silently falls back to the plain keyboard. This is a known RN
 *    regression since 0.76.2 (facebook/react-native#47865), present in the
 *    Expo 54 RN version this app runs. Giving each field its own nativeID
 *    (CardFront suffixes `${inputAccessoryViewID}-${key}`) sidesteps it.
 *
 * Only the view matching the currently selected field renders real content;
 * the rest render the same empty bar as the "nothing focused yet" case, so
 * they're ready the instant that field gets focus.
 *
 * On Android (no InputAccessoryView), renders nothing here -- EditorLayoutV1
 * falls back to showing the bar inline above the card instead, since
 * Android's keyboard has no equivalent docking surface.
 */
export function AccessoryBarHost({ field, onOpenKerning }: AccessoryBarProps) {
  if (Platform.OS !== 'ios') return null;

  return (
    <>
      {ALL_FIELD_KEYS.map((key) => (
        <InputAccessoryView key={key} nativeID={`${EDITOR_ACCESSORY_VIEW_ID}-${key}`}>
          <AccessoryBarContent field={key === field ? field : null} onOpenKerning={onOpenKerning} />
        </InputAccessoryView>
      ))}
    </>
  );
}

export function AccessoryBarInline(props: AccessoryBarProps) {
  return <AccessoryBarContent {...props} />;
}

/** Used by the Kerning-sheet flow to drop focus before the sheet opens. */
export function dismissKeyboard() {
  Keyboard.dismiss();
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  button: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.xs,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 20,
    backgroundColor: 'rgba(128,128,128,0.4)',
  },
  spacer: {
    flex: 1,
  },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
