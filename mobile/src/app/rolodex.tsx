import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContactTile } from '@/components/ContactTile';
import { ThemedText } from '@/components/themed-text';
import { Motion, Spacing } from '@/constants/theme';
import { useOrientationLock } from '@/hooks/use-orientation-lock';
import { useTheme } from '@/hooks/use-theme';
import { useRolodexStore } from '@/store/useRolodexStore';
import type { ContactCard } from '@/types/card';

type ViewMode = 'grid' | 'list' | 'wheel';

function topLabel(contact: ContactCard): string {
  return contact.fields.context === 'employed' ? contact.fields.companyName : contact.fields.headline;
}

function roleLine(contact: ContactCard): string {
  return contact.fields.context === 'employed' ? contact.fields.jobTitle : contact.fields.targetRole;
}

function matchesQuery(contact: ContactCard, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    contact.fields.fullName.toLowerCase().includes(q) ||
    topLabel(contact).toLowerCase().includes(q) ||
    roleLine(contact).toLowerCase().includes(q)
  );
}

export default function RolodexScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  // Conventional list UI, not the landscape card stage -- see card.tsx's
  // analogous lock for why this needs to be explicit rather than inherited.
  useOrientationLock(ScreenOrientation.OrientationLock.PORTRAIT_UP);

  const contacts = useRolodexStore((state) => state.contacts);
  const folders = useRolodexStore((state) => state.folders);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [query, setQuery] = useState('');
  const [folderFilter, setFolderFilter] = useState<string | 'all'>('all');

  const filtered = useMemo(() => {
    return contacts
      .filter((c) => folderFilter === 'all' || c.folderId === folderFilter)
      .filter((c) => matchesQuery(c, query));
  }, [contacts, folderFilter, query]);

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.background, paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom },
      ]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => {
              // Settle the LANDSCAPE lock here, before navigating back,
              // instead of leaving it solely to card.tsx's own
              // useFocusEffect relock -- with this screen's PORTRAIT_UP
              // lock still live for a beat during the dismiss, both screens
              // issuing their own lockAsync independently raced and
              // produced a spurious landscape -> portrait -> landscape
              // triple-rotation, the same class of race fixed for the
              // editor's Done button and the forward card -> rolodex trip.
              ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
              router.back();
            }}
            hitSlop={Spacing.md}
            style={styles.backHit}>
            <SymbolView name="chevron.left" size={18} tintColor={theme.text} />
          </Pressable>
          <ThemedText font="serif" style={styles.wordmark}>
            Rolodex.
          </ThemedText>
          <View style={styles.modeSwitch}>
            <ModeButton mode="grid" active={viewMode === 'grid'} onPress={() => setViewMode('grid')} />
            <ModeButton mode="list" active={viewMode === 'list'} onPress={() => setViewMode('list')} />
            <ModeButton mode="wheel" active={viewMode === 'wheel'} onPress={() => setViewMode('wheel')} />
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: theme.backgroundElement }]}>
          <SymbolView name="magnifyingglass" size={14} tintColor={theme.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search connections"
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', name: 'All', isActive: false }, ...folders]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chipRow}
          renderItem={({ item }) => {
            const selected = folderFilter === 'all' ? item.id === 'all' : folderFilter === item.id;
            const count =
              item.id === 'all' ? contacts.length : contacts.filter((c) => c.folderId === item.id).length;
            return (
              <Pressable
                onPress={() => setFolderFilter(item.id === 'all' ? 'all' : item.id)}
                style={[
                  styles.chip,
                  { backgroundColor: selected ? theme.text : theme.backgroundElement },
                ]}>
                {'isActive' in item && item.isActive && <View style={[styles.activeDot, { backgroundColor: selected ? theme.background : theme.text }]} />}
                <ThemedText
                  style={{
                    color: selected ? theme.background : theme.text,
                    fontSize: 12,
                    letterSpacing: 0.3,
                  }}>
                  {item.name}
                </ThemedText>
                <ThemedText style={{ color: selected ? theme.background : theme.text, fontSize: 11, opacity: 0.5 }}>
                  {count}
                </ThemedText>
              </Pressable>
            );
          }}
        />
      </View>

      {filtered.length === 0 ? (
        <EmptyState hasQuery={query.trim().length > 0} />
      ) : viewMode === 'grid' ? (
        <FlatList
          key="grid"
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item }) => (
            <View style={styles.gridCell}>
              <ContactTile contact={item} />
            </View>
          )}
        />
      ) : viewMode === 'list' ? (
        <FlatList
          key="list"
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.listRow, { borderBottomColor: theme.hairline }]}>
              <ContactTile contact={item} variant="compact" />
              <View style={styles.listText}>
                <ThemedText font="serif" numberOfLines={1} style={{ fontSize: 14 }}>
                  {item.fields.fullName}
                </ThemedText>
                <ThemedText numberOfLines={1} style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
                  {topLabel(item)} · {roleLine(item)}
                </ThemedText>
              </View>
              {item.starred && <SymbolView name="star.fill" size={12} tintColor={theme.text} />}
            </View>
          )}
        />
      ) : (
        <Wheel contacts={filtered} />
      )}
    </View>
  );
}

function ModeButton({
  mode,
  active,
  onPress,
}: {
  mode: ViewMode;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const icon = mode === 'grid' ? 'square.grid.2x2' : mode === 'list' ? 'list.bullet' : 'arrow.up.and.down';
  return (
    <Pressable
      onPress={onPress}
      style={[styles.modeButton, { backgroundColor: active ? theme.backgroundSelected : 'transparent' }]}>
      <SymbolView name={icon} size={14} tintColor={active ? theme.text : theme.textSecondary} />
    </Pressable>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.emptyWrap}>
      <ThemedText font="serif" style={{ fontSize: 17 }}>
        {hasQuery ? 'No matches.' : 'Nothing collected yet.'}
      </ThemedText>
      <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: Spacing.sm, textAlign: 'center', maxWidth: 220 }}>
        {hasQuery ? 'Try a different name or company.' : 'Scan a card or tap phones to start your collection.'}
      </ThemedText>
    </View>
  );
}

// The vertical spacing between adjacent contacts' resting centers -- tuned
// so three rows (prev / current / next) comfortably fit the stage with the
// current one enlarged.
// Visual spacing between adjacent cards' resting centers -- kept tight so
// neighbors overlap the focused card like a real stacked deck, rather than
// sitting apart from it.
const WHEEL_ITEM_SPACING = 34;
// How far a drag has to travel (in px) to count as one full step to the
// next/prev contact. Deliberately larger than WHEEL_ITEM_SPACING: with the
// cards this tightly stacked, 1:1 tracking would make a full step (and so
// the next contact) fire on a barely-there flick.
const WHEEL_DRAG_PER_ITEM = 92;

/**
 * A native-picker-wheel interaction (iOS UIPickerView / the system time
 * picker): drag up/down to spin through the collection, the centered item
 * reads large and full-opacity, neighbors shrink and fade the further they
 * sit from center, and releasing mid-drag snaps to the nearest whole item.
 * `offset` is a continuous shared value in "items" (not pixels) so the
 * whole wheel can be driven by one number -- an integer at rest, fractional
 * mid-drag.
 */
function Wheel({ contacts }: { contacts: ContactCard[] }) {
  const theme = useTheme();
  const total = contacts.length;
  const offset = useSharedValue(0);
  const dragStartOffset = useSharedValue(0);
  const [centerIndex, setCenterIndex] = useState(0);

  const clampOffset = (value: number) => {
    'worklet';
    return Math.max(0, Math.min(total - 1, value));
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      dragStartOffset.value = offset.value;
    })
    .onUpdate((event) => {
      // Dragging UP (negative translationY) moves further into the list --
      // matches a native picker's direction: pull up to advance.
      offset.value = clampOffset(dragStartOffset.value - event.translationY / WHEEL_DRAG_PER_ITEM);
    })
    .onEnd((event) => {
      const projected = offset.value - event.velocityY / WHEEL_DRAG_PER_ITEM / 8;
      const snapped = clampOffset(Math.round(projected));
      offset.value = withSpring(snapped, Motion.spring);
      runOnJS(setCenterIndex)(snapped);
    });

  if (total === 0) return null;

  return (
    <View style={styles.wheelWrap}>
      <ThemedText variant="label" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
        Card {centerIndex + 1} of {total}
      </ThemedText>
      <GestureDetector gesture={pan}>
        <View style={styles.wheelStage}>
          {contacts.map((contact, i) => (
            <WheelItem key={contact.id} contact={contact} itemIndex={i} offset={offset} />
          ))}
        </View>
      </GestureDetector>
    </View>
  );
}

function WheelItem({
  contact,
  itemIndex,
  offset,
}: {
  contact: ContactCard;
  itemIndex: number;
  offset: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const distance = itemIndex - offset.value;
    // Falls off to fully hidden past 2 items away, so only a handful of
    // neighbors ever render visibly -- keeps the stack cheap regardless of
    // collection size.
    const clamped = Math.max(-2, Math.min(2, distance));
    const abs = Math.abs(clamped);
    // The focused card (abs -> 0) scales UP past 1, not just down from it,
    // so it visibly dominates the stack rather than merely being the least
    // shrunk of the three.
    const scale = 1.18 - abs * 0.24;
    return {
      transform: [{ translateY: clamped * WHEEL_ITEM_SPACING }, { scale }],
      opacity: 1 - abs * 0.4,
      zIndex: 100 - Math.round(abs * 10),
    };
  });

  return (
    <Animated.View style={[styles.wheelItem, style]} pointerEvents="none">
      <ContactTile contact={contact} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backHit: { padding: Spacing.xs },
  wordmark: { fontSize: 22, letterSpacing: 0.5 },
  modeSwitch: { flexDirection: 'row', gap: Spacing.xxs },
  modeButton: { width: 30, height: 26, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + Spacing.xxs,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  chipRow: { gap: Spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md - Spacing.xxs,
    paddingVertical: Spacing.xs + Spacing.xxs,
    borderRadius: 100,
  },
  activeDot: { width: 5, height: 5, borderRadius: 3 },
  gridContent: { padding: Spacing.lg, gap: Spacing.md },
  gridRow: { gap: Spacing.md },
  gridCell: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm + Spacing.xxs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listText: { flex: 1, minWidth: 0 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  wheelWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // Tall enough to hold the full falloff range (2 items either side of
  // center) without clipping; width matches the grid tile's own sizing.
  // Height covers the falloff range at the tighter spacing; width leaves
  // headroom either side for the focused card's 1.18x scale-up so it never
  // clips against the stage bounds.
  wheelStage: { width: 260, height: WHEEL_ITEM_SPACING * 5 + 60, alignItems: 'center', justifyContent: 'center' },
  // Absolutely positioned and stacked on the stage's center -- each item's
  // animated translateY/scale/opacity (driven by its distance from the
  // dragged offset) is what actually places it, picker-wheel style.
  wheelItem: { position: 'absolute', width: '100%' },
});
