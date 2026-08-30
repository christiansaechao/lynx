import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { EditorSheet } from '@/components/editor/EditorSheet';
import { ThemedText } from '@/components/themed-text';
import {
  buildUrl,
  getPlatform,
  parseUrl,
  STANDARD_PLATFORMS,
  stripPrefix,
} from '@/constants/linkPlatforms';
import { Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCardStore } from '@/store/useCardStore';

interface AddLinkSheetProps {
  visible: boolean;
  onClose: () => void;
  /**
   * When set, the sheet edits this existing link instead of adding a new
   * one: the platform + slug are prefilled from it, the primary button
   * saves in place, and a Delete button is shown.
   */
  editLinkId?: string | null;
}

const DEFAULT_PLATFORM = STANDARD_PLATFORMS[0].id;

export function AddLinkSheet({ visible, onClose, editLinkId }: AddLinkSheetProps) {
  const addLink = useCardStore((state) => state.addLink);
  const updateLink = useCardStore((state) => state.updateLink);
  const removeLink = useCardStore((state) => state.removeLink);
  const editingLink = useCardStore((state) =>
    editLinkId ? state.card.links.find((link) => link.id === editLinkId) ?? null : null,
  );
  const theme = useTheme();

  const inputRef = useRef<TextInput>(null);

  const [platformId, setPlatformId] = useState(DEFAULT_PLATFORM);
  // The slug is the part *after* the grey prefix — just the handle for a
  // prefixed platform, or the whole URL for Portfolio / Other.
  const [slug, setSlug] = useState('');
  const [focused, setFocused] = useState(false);

  const spec = useMemo(() => getPlatform(platformId), [platformId]);

  // Load the edited link into the field when the sheet opens on one.
  useEffect(() => {
    if (!visible) return;
    if (editingLink) {
      const parsed = parseUrl(editingLink.url);
      setPlatformId(parsed.id);
      setSlug(parsed.slug);
    } else {
      setPlatformId(DEFAULT_PLATFORM);
      setSlug('');
    }
  }, [visible, editingLink]);

  const reset = () => {
    setPlatformId(DEFAULT_PLATFORM);
    setSlug('');
  };

  // Commit whatever's in the field as a link, if it forms a valid URL.
  // Returns whether anything was written, so callers can decide about reset.
  const commit = () => {
    // buildUrl still returns `prefix + ''` for a prefixed platform with an
    // empty handle -- a bare `https://github.com/` is not a real link, so
    // require the user to have actually typed a slug.
    if (!stripPrefix(platformId, slug).trim()) return false;
    const url = buildUrl(platformId, slug);
    if (!url) return false;
    if (editingLink) {
      updateLink(editingLink.id, { platform: platformId, url });
    } else {
      addLink({ platform: platformId, url, isActive: true });
    }
    return true;
  };

  const handleDelete = () => {
    if (!editingLink) return;
    Alert.alert('Delete link?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeLink(editingLink.id);
          reset();
          onClose();
        },
      },
    ]);
  };

  const handleAdd = () => {
    if (!commit()) return;
    reset();
    onClose();
  };

  // "Done" (or a tap outside / swipe-down) should not silently drop a
  // handle the user already typed -- treat it as an implicit Add, then
  // close. An empty or half-typed field just closes.
  const handleClose = () => {
    commit();
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
    <EditorSheet title={editingLink ? 'Edit Link' : 'Add Link'} visible={visible} onClose={handleClose}>
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

      <View
        style={[
          styles.field,
          { borderColor: focused ? theme.text : theme.hairline },
        ]}>
        {spec.prefix ? (
          // Tapping the grey prefix is really "I want to start typing after
          // it" -- forward the tap to the input rather than doing nothing.
          <Pressable onPress={() => inputRef.current?.focus()} hitSlop={Spacing.xs}>
            <ThemedText style={[styles.prefix, { color: theme.textSecondary }]} numberOfLines={1}>
              {spec.prefix.replace(/^https:\/\//, '')}
            </ThemedText>
          </Pressable>
        ) : null}
        <TextInput
          ref={inputRef}
          placeholder={spec.placeholder}
          placeholderTextColor={theme.textSecondary}
          value={slug}
          onChangeText={handleChangeSlug}
          onSubmitEditing={handleAdd}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          returnKeyType="done"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={spec.keyboard === 'url' ? 'url' : 'default'}
          style={[styles.input, { color: theme.text }]}
        />
        <Pressable onPress={handleAdd} disabled={!slug.trim()} hitSlop={Spacing.sm} style={styles.addBtn}>
          <ThemedText variant="button" style={!slug.trim() ? { color: theme.textSecondary } : undefined}>
            {editingLink ? 'Save' : 'Add'}
          </ThemedText>
        </Pressable>
      </View>

      {editingLink ? (
        <Pressable onPress={handleDelete} hitSlop={Spacing.sm} style={styles.deleteBtn}>
          <ThemedText variant="button" style={styles.deleteLabel}>
            Delete
          </ThemedText>
        </Pressable>
      ) : null}
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
    // 2px so the focused highlight (same width, darker colour) reads as a
    // state change rather than a thickness jump.
    borderBottomWidth: 2,
    paddingVertical: Spacing.md,
  },
  prefix: {
    fontSize: Typography.heading.fontSize,
  },
  input: {
    flex: 1,
    fontSize: Typography.heading.fontSize,
    padding: 0,
  },
  addBtn: {
    paddingLeft: Spacing.sm,
  },
  deleteBtn: {
    marginTop: Spacing.lg,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  // iOS destructive-action red; the rest of the UI is strict monochrome.
  deleteLabel: {
    color: '#FF3B30',
  },
});
