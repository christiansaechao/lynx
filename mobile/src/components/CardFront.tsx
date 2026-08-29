import { Pressable, StyleSheet, TextInput, TextStyle, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { CardMaterial, useCardTemplateStyle } from '@/components/CardMaterial';
import { ThemedText } from '@/components/themed-text';
import { Card, Fonts, Spacing } from '@/constants/theme';
import { useCardStore } from '@/store/useCardStore';
import type { EditableFieldKey } from '@/types/card';

interface CardFrontProps {
  editable: boolean;
  tilt: { beta: SharedValue<number>; gamma: SharedValue<number> };
  /** Rendered into the offscreen Master QR snapshot -- forces translucent materials opaque. */
  forSnapshot?: boolean;
  onSelectField?: (key: EditableFieldKey) => void;
  onTap?: () => void;
  /**
   * iOS only (InputAccessoryView has no Android equivalent -- see RN docs).
   * When set, used as a prefix: each field gets its own
   * `${inputAccessoryViewID}-${key}` id rather than sharing one id across
   * every TextInput. RN has a regression (facebook/react-native#47865,
   * present since 0.76.2) where a single inputAccessoryViewID shared by
   * multiple TextInputs only docks for whichever field is focused first --
   * every other field silently falls back to the plain keyboard. Per-field
   * ids sidestep it; the layout's AccessoryBarHost mounts one
   * InputAccessoryView per field to match.
   */
  inputAccessoryViewID?: string;
}

export function CardFront({ editable, tilt, forSnapshot = false, onSelectField, onTap, inputAccessoryViewID }: CardFrontProps) {
  const card = useCardStore((state) => state.card);
  const setField = useCardStore((state) => state.setField);
  const template = useCardTemplateStyle(
    card.templateId,
    card.materialId,
    card.fontId,
    card.fontColorId,
    card.fontColorHex,
  );
  const textColor = template.textColor;
  const fontFamily = Fonts?.[template.fontFamily];
  const reliefShadow = template.reliefTextShadow;

  const { fields } = card;
  const topLabel = fields.context === 'employed' ? fields.companyName : fields.headline;
  const roleLabel = fields.context === 'employed' ? fields.jobTitle : fields.targetRole;
  const subLabel = fields.context === 'employed' ? fields.department : fields.education;
  const topKey: EditableFieldKey = fields.context === 'employed' ? 'companyName' : 'headline';
  const roleKey: EditableFieldKey = fields.context === 'employed' ? 'jobTitle' : 'targetRole';
  const subKey: EditableFieldKey = fields.context === 'employed' ? 'department' : 'education';

  const renderField = (
    key: EditableFieldKey,
    value: string,
    style: TextStyle | TextStyle[],
    placeholder: string,
    color: string = textColor,
  ) => {
    const fieldStyle = card.fieldStyles[key];

    // Hidden fields never render on the shared/view-only card. In the editor
    // they stay visible at reduced opacity, same pattern as CardBack's
    // inactive links, so they can still be found and re-enabled.
    if (fieldStyle?.hidden && !editable) return null;

    // Callers pass either a single style object or an array (e.g.
    // [styles.topLabel, { letterSpacing }]) -- flatten to read the base
    // letterSpacing regardless of which shape came in.
    const baseLetterSpacing = StyleSheet.flatten(style).letterSpacing ?? 0;

    // allCaps is display-only -- it transforms how the value is shown, not
    // the stored value itself, so the user's actual typed casing is never
    // touched. textTransform can't be used here because it would also
    // affect the caret's underlying TextInput value on some platforms.
    const overrideStyle = {
      fontWeight: fieldStyle?.bold ? ('700' as const) : undefined,
      fontStyle: fieldStyle?.italic ? ('italic' as const) : undefined,
      letterSpacing: baseLetterSpacing + (fieldStyle?.kerning ?? 0),
      opacity: fieldStyle?.hidden ? 0.35 : undefined,
    };

    if (!editable) {
      const displayValue = fieldStyle?.allCaps ? value.toUpperCase() : value;
      return displayValue ? (
        <ThemedText style={[style, overrideStyle, reliefShadow, { color, fontFamily }]}>{displayValue}</ThemedText>
      ) : null;
    }
    return (
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={`${color}66`}
        onChangeText={(text) => setField(key, text)}
        onFocus={() => onSelectField?.(key)}
        inputAccessoryViewID={inputAccessoryViewID ? `${inputAccessoryViewID}-${key}` : undefined}
        // These are card design fields, not a real form -- iOS infers
        // "this is an email/contact field" from the placeholder/label text
        // even with no explicit hint, and shows its own QuickType strip
        // (e.g. "Hide My Email", saved contacts) above the keyboard. That
        // competes with our own docked accessory bar for the same space.
        // Explicitly opting out of autofill suppresses it.
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
        style={[style, overrideStyle, reliefShadow, fieldStyle?.allCaps && styles.allCapsInput, { color, fontFamily }]}
      />
    );
  };

  return (
    <Pressable style={styles.pressable} onPress={onTap}>
      <CardMaterial templateId={card.templateId} materialId={card.materialId} tilt={tilt} opaque={forSnapshot}>
        <View style={styles.content}>
          {renderField(
            topKey,
            topLabel,
            [styles.topLabel, { letterSpacing: template.labelLetterSpacing }],
            'Company / Headline',
            template.labelColor,
          )}

          <View style={styles.center}>
            {renderField('fullName', fields.fullName, [styles.name, { letterSpacing: template.nameLetterSpacing }], 'Full Name')}
            {renderField(roleKey, roleLabel, styles.role, 'Title / Target Role', template.labelColor)}
            {renderField(subKey, subLabel, styles.sub, 'Department / Education', template.labelColor)}
          </View>

          <View style={styles.footer}>
            {renderField('location', fields.location, styles.footerText, 'Location', template.labelColor)}
            {renderField('phone', fields.phone, styles.footerText, 'Phone', template.labelColor)}
            {renderField('email', fields.email, styles.footerText, 'Email', template.labelColor)}
          </View>
        </View>
      </CardMaterial>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { flex: 1 },
  allCapsInput: {
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: Card.padding,
  },
  topLabel: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  center: {
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 1,
  },
  role: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  sub: {
    fontSize: 11,
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  footerText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
