import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { EditorSheet } from '@/components/editor/EditorSheet';
import { ThemedText } from '@/components/themed-text';
import {
  buildUrl,
  getPlatform,
  STANDARD_PLATFORMS,
  stripPrefix,
} from '@/constants/linkPlatforms';
import { Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCardStore } from '@/store/useCardStore';

interface AddLinkSheetProps {
  visible: boolean;
  onClose: () => void;
}

const DEFAULT_PLATFORM = STANDARD_PLATFORMS[0].id;

export function AddLinkSheet({ visible, onClose }: AddLinkSheetProps) {
  const addLink = useCardStore((state) => state.addLink);
  const theme = useTheme();

  const [platformId, setPlatformId] = useState(DEFAULT_PLATFORM);
  // The slug is the part *after* the grey prefix — just the handle for a
  // prefixed platform, or the whole URL for Portfolio / Other.
  const [slug, setSlug] = useState('');

  const spec = useMemo(() => getPlatform(platformId), [platformId]);

  const reset = () => {
    setPlatformId(DEFAULT_PLATFORM);
    setSlug('');
  };

  const handleAdd = () => {
    const url = buildUrl(platformId, slug);
    if (!url) return;
    addLink({ platform: platformId, url, isActive: true });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // The paste wrinkle: someone pastes a full `https://linkedin.com/in/x`
  // into a field that already shows `linkedin.com/in/` as its prefix.
  // Strip the scheme, `www.`, the platform's own prefix, a leading `@` and
  // any trailing slash so only the tail lands in the field.
  const handleChangeSlug = (text: string) => {
    setSlug(spec.prefix ? stripPrefix(platformId, text) : text);
  };

  return (
    <EditorSheet title="Add Link" visible={visible} onClose={handleClose}>
      <View style={styles.chips}>
        {STANDARD_PLATFORMS.map((option) => {
          const selected = option.id === platformId;
          return (
            <Pressable
              key={option.id}
              hitSlop={Spacing.xs}
              onPress={() => {
                setPlatformId(option.id);
                setSlug('');
              }}
              style={[
                styles.chip,
                { borderColor: theme.hairline },
                selected && { backgroundColor: theme.backgroundSelected, borderColor: theme.text },
              ]}>
              {Platform.OS === 'ios' && option.symbol ? (
                <SymbolView
                  name={option.symbol as never}
                  size={16}
                  weight="regular"
                  tintColor={theme.text}
                />
              ) : null}
              <ThemedText variant="label" style={{ color: theme.text }}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.field, { borderColor: theme.hairline }]}>
        {spec.prefix ? (
          <ThemedText style={[styles.prefix, { color: theme.textSecondary }]} numberOfLines={1}>
            {spec.prefix.replace(/^https:\/\//, '')}
          </ThemedText>
        ) : null}
        <TextInput
          placeholder={spec.placeholder}
          placeholderTextColor={theme.textSecondary}
          value={slug}
          onChangeText={handleChangeSlug}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={spec.keyboard === 'url' ? 'url' : 'default'}
          style={[styles.input, { color: theme.text }]}
        />
        <Pressable onPress={handleAdd} disabled={!slug.trim()} hitSlop={Spacing.sm} style={styles.addBtn}>
          <ThemedText variant="button" style={!slug.trim() ? { color: theme.textSecondary } : undefined}>
            Add
          </ThemedText>
        </Pressable>
      </View>
    </EditorSheet>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: Spacing.sm,
    // Roomy enough to be an easy tap target -- ~44pt tall with the label's
    // line height, rather than the skinny pill the tighter padding gave.
    paddingVertical: Spacing.sm + Spacing.xxs,
    paddingHorizontal: Spacing.md,
  },
  // The prefix and input share one bordered box so they read as a single
  // field — the grey prefix is a label the caret simply starts after.
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: Spacing.sm,
  },
  prefix: {
    fontSize: Typography.body.fontSize,
  },
  input: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    padding: 0,
  },
  addBtn: {
    paddingLeft: Spacing.sm,
  },
});
