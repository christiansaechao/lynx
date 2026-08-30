import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
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
import type { ContactCard, RolodexFolder } from '@/types/card';

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
  const addFolder = useRolodexStore((state) => state.addFolder);
  const setActiveFolder = useRolodexStore((state) => state.setActiveFolder);
  const toggleStarred = useRolodexStore((state) => state.toggleStarred);
  const setNote = useRolodexStore((state) => state.setNote);
  const setContactFolder = useRolodexStore((state) => state.setContactFolder);
  const addContactsToFolder = useRolodexStore((state) => state.addContactsToFolder);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [query, setQuery] = useState('');
  const [folderFilter, setFolderFilter] = useState<string | 'all'>('all');
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  /** The contact whose action sheet (star / note / folder) is open, if any. */
  const [actionContactId, setActionContactId] = useState<string | null>(null);
  const actionContact = actionContactId
    ? contacts.find((c) => c.id === actionContactId) ?? null
    : null;
  /** When set, the folder-side bulk "add contacts" picker is open, targeting this folder id. */
  const [bulkAddFolderId, setBulkAddFolderId] = useState<string | null>(null);
  const bulkAddFolder = bulkAddFolderId
    ? folders.find((f) => f.id === bulkAddFolderId) ?? null
    : null;

  const activeFolder = folders.find((f) => f.isActive) ?? null;
  const unsortedCount = useMemo(() => contacts.filter((c) => !c.sortedAt).length, [contacts]);

  const createFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;
    const id = addFolder(name);
    setActiveFolder(id);
    setFolderFilter(id);
    setNewFolderName('');
    setNewFolderOpen(false);
  };

  /** Create a folder from inside a picker without touching the filter/active state. */
  const createFolderInline = (name: string) => addFolder(name.trim());

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
          ListFooterComponent={
            <Pressable
              onPress={() => setNewFolderOpen(true)}
              style={[styles.chip, styles.addChip, { borderColor: theme.hairline }]}>
              <SymbolView name="plus" size={12} tintColor={theme.textSecondary} />
              <ThemedText style={{ color: theme.textSecondary, fontSize: 12, letterSpacing: 0.3 }}>
                Folder
              </ThemedText>
            </Pressable>
          }
          renderItem={({ item }) => {
            const selected = folderFilter === 'all' ? item.id === 'all' : folderFilter === item.id;
            const count =
              item.id === 'all' ? contacts.length : contacts.filter((c) => c.folderId === item.id).length;
            const isFolder = item.id !== 'all';
            return (
              <Pressable
                onPress={() => setFolderFilter(item.id === 'all' ? 'all' : item.id)}
                onLongPress={
                  isFolder ? () => setActiveFolder(item.isActive ? null : item.id) : undefined
                }
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

        <View style={styles.metaRow}>
          <ThemedText style={{ flex: 1, fontSize: 11, color: theme.textSecondary }}>
            {activeFolder
              ? `Routing new scans into "${activeFolder.name}" · long-press to stop`
              : 'No active folder · long-press one to route new scans into it'}
          </ThemedText>
          {folderFilter !== 'all' && (
            <Pressable
              onPress={() => setBulkAddFolderId(folderFilter)}
              style={[styles.addToFolderBtn, { borderColor: theme.hairline }]}>
              <SymbolView name="plus" size={12} tintColor={theme.text} />
              <ThemedText style={{ fontSize: 12, color: theme.text }}>Add</ThemedText>
            </Pressable>
          )}
        </View>

        {unsortedCount > 0 && (
          <Pressable
            onPress={() => router.push('/sort')}
            style={[styles.sortBanner, { backgroundColor: theme.text }]}>
            <SymbolView name="rectangle.stack" size={15} tintColor={theme.background} />
            <ThemedText style={{ flex: 1, fontSize: 13, color: theme.background }}>
              Sort {unsortedCount} new {unsortedCount === 1 ? 'connection' : 'connections'}
            </ThemedText>
            <SymbolView name="chevron.right" size={12} tintColor={theme.background} />
          </Pressable>
        )}
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
            <Pressable style={styles.gridCell} onPress={() => setActionContactId(item.id)}>
              <ContactTile contact={item} />
            </Pressable>
          )}
        />
      ) : viewMode === 'list' ? (
        <FlatList
          key="list"
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setActionContactId(item.id)}
              style={[styles.listRow, { borderBottomColor: theme.hairline }]}>
              <ContactTile contact={item} variant="compact" />
              <View style={styles.listText}>
                <ThemedText font="serif" numberOfLines={1} style={{ fontSize: 14 }}>
                  {item.fields.fullName}
                </ThemedText>
                <ThemedText numberOfLines={1} style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
                  {topLabel(item)} · {roleLine(item)}
                </ThemedText>
              </View>
              {item.note ? <SymbolView name="note.text" size={12} tintColor={theme.textSecondary} /> : null}
              {item.starred && <SymbolView name="star.fill" size={12} tintColor={theme.text} />}
            </Pressable>
          )}
        />
      ) : (
        <Wheel contacts={filtered} />
      )}

      {newFolderOpen && (
        <NewFolderOverlay
          value={newFolderName}
          onChangeText={setNewFolderName}
          onCancel={() => {
            setNewFolderName('');
            setNewFolderOpen(false);
          }}
          onCreate={createFolder}
        />
      )}

      {actionContact && (
        <ContactActionOverlay
          key={actionContact.id}
          contact={actionContact}
          folders={folders}
          onClose={() => setActionContactId(null)}
          onToggleStar={() => toggleStarred(actionContact.id)}
          onSaveNote={(note) => setNote(actionContact.id, note)}
          onSetFolder={(folderId) => setContactFolder(actionContact.id, folderId)}
          onCreateFolder={createFolderInline}
        />
      )}

      {bulkAddFolder && (
        <BulkAddOverlay
          folder={bulkAddFolder}
          contacts={contacts}
          onClose={() => setBulkAddFolderId(null)}
          onConfirm={(ids) => {
            addContactsToFolder(ids, bulkAddFolder.id);
            setBulkAddFolderId(null);
          }}
        />
      )}
    </View>
  );
}

function NewFolderOverlay({
  value,
  onChangeText,
  onCancel,
  onCreate,
}: {
  value: string;
  onChangeText: (v: string) => void;
  onCancel: () => void;
  onCreate: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable style={styles.scrim} onPress={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.background, borderColor: theme.hairline }]}
          onPress={() => {}}>
          <ThemedText font="serif" style={{ fontSize: 17 }}>
            New event folder
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: Spacing.xs }}>
            It becomes the active folder — new scans route straight into it.
          </ThemedText>
          <TextInput
            autoFocus
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onCreate}
            placeholder="e.g. Tech Fair 2026"
            placeholderTextColor={theme.textSecondary}
            returnKeyType="done"
            style={[
              styles.sheetInput,
              { color: theme.text, backgroundColor: theme.backgroundElement },
            ]}
          />
          <View style={styles.sheetActions}>
            <Pressable onPress={onCancel} style={styles.sheetBtn}>
              <ThemedText style={{ fontSize: 14, color: theme.textSecondary }}>Cancel</ThemedText>
            </Pressable>
            <Pressable
              onPress={onCreate}
              disabled={!value.trim()}
              style={[
                styles.sheetBtn,
                styles.sheetBtnPrimary,
                { backgroundColor: theme.text, opacity: value.trim() ? 1 : 0.35 },
              ]}>
              <ThemedText style={{ fontSize: 14, color: theme.background }}>Create</ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Pressable>
  );
}

function ContactActionOverlay({
  contact,
  folders,
  onClose,
  onToggleStar,
  onSaveNote,
  onSetFolder,
  onCreateFolder,
}: {
  contact: ContactCard;
  folders: RolodexFolder[];
  onClose: () => void;
  onToggleStar: () => void;
  onSaveNote: (note: string | null) => void;
  onSetFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string) => string;
}) {
  const theme = useTheme();
  const [draft, setDraft] = useState(contact.note ?? '');
  const [newFolderMode, setNewFolderMode] = useState(false);
  const [newFolderDraft, setNewFolderDraft] = useState('');

  const commitNote = () => {
    const trimmed = draft.trim();
    onSaveNote(trimmed.length ? trimmed : null);
  };

  const confirmNewFolder = () => {
    const name = newFolderDraft.trim();
    if (!name) return;
    const id = onCreateFolder(name);
    onSetFolder(id);
    setNewFolderDraft('');
    setNewFolderMode(false);
  };

  return (
    <Pressable
      style={styles.scrim}
      onPress={() => {
        commitNote();
        onClose();
      }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.background, borderColor: theme.hairline }]}
          onPress={() => {}}>
          <ThemedText font="serif" numberOfLines={1} style={{ fontSize: 17 }}>
            {contact.fields.fullName}
          </ThemedText>
          <ThemedText numberOfLines={1} style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
            {topLabel(contact)} · {roleLine(contact)}
          </ThemedText>

          <Pressable
            onPress={onToggleStar}
            style={[styles.starRow, { borderColor: theme.hairline }]}>
            <SymbolView
              name={contact.starred ? 'star.fill' : 'star'}
              size={16}
              tintColor={theme.text}
            />
            <ThemedText style={{ fontSize: 14 }}>
              {contact.starred ? 'Starred' : 'Star this contact'}
            </ThemedText>
          </Pressable>

          <ThemedText variant="label" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
            Folder
          </ThemedText>
          <View style={styles.folderPickRow}>
            <FolderPill
              label="None"
              selected={contact.folderId === null}
              onPress={() => onSetFolder(null)}
              theme={theme}
            />
            {folders.map((f) => (
              <FolderPill
                key={f.id}
                label={f.name}
                selected={contact.folderId === f.id}
                onPress={() => onSetFolder(f.id)}
                theme={theme}
              />
            ))}
            {newFolderMode ? (
              <View style={[styles.newFolderInline, { borderColor: theme.text }]}>
                <TextInput
                  autoFocus
                  value={newFolderDraft}
                  onChangeText={setNewFolderDraft}
                  onSubmitEditing={confirmNewFolder}
                  placeholder="Folder name"
                  placeholderTextColor={theme.textSecondary}
                  returnKeyType="done"
                  style={{ minWidth: 110, fontSize: 12, color: theme.text, padding: 0 }}
                />
                <Pressable onPress={confirmNewFolder} hitSlop={Spacing.sm}>
                  <SymbolView name="checkmark" size={12} tintColor={theme.text} />
                </Pressable>
              </View>
            ) : (
              <FolderPill
                label="+ New"
                selected={false}
                onPress={() => setNewFolderMode(true)}
                theme={theme}
              />
            )}
          </View>

          <ThemedText variant="label" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
            Private note
          </ThemedText>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            multiline
            placeholder="Met at the Google booth, loves React Native…"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.noteInput,
              { color: theme.text, backgroundColor: theme.backgroundElement },
            ]}
          />
          <View style={styles.sheetActions}>
            <Pressable
              onPress={() => {
                commitNote();
                onClose();
              }}
              style={[styles.sheetBtn, styles.sheetBtnPrimary, { backgroundColor: theme.text }]}>
              <ThemedText style={{ fontSize: 14, color: theme.background }}>Done</ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Pressable>
  );
}

function FolderPill({
  label,
  selected,
  onPress,
  theme,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.folderPill,
        {
          backgroundColor: selected ? theme.text : theme.backgroundElement,
          borderColor: selected ? theme.text : theme.hairline,
        },
      ]}>
      <ThemedText style={{ fontSize: 12, color: selected ? theme.background : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

/**
 * The folder-side bulk add: pick a folder chip, tap "Add", check off recent
 * contacts, confirm. Lists ALL contacts newest-first; ones already in this
 * folder start checked, so unchecking removes them.
 */
function BulkAddOverlay({
  folder,
  contacts,
  onClose,
  onConfirm,
}: {
  folder: RolodexFolder;
  contacts: ContactCard[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}) {
  const theme = useTheme();
  const ordered = useMemo(
    () =>
      contacts
        .slice()
        .sort((a, b) => (a.collectedAt < b.collectedAt ? 1 : -1)),
    [contacts],
  );
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(contacts.filter((c) => c.folderId === folder.id).map((c) => c.id)),
  );

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Pressable style={styles.scrim} onPress={onClose}>
      <Pressable
        style={[styles.bulkSheet, { backgroundColor: theme.background, borderColor: theme.hairline }]}
        onPress={() => {}}>
        <View style={styles.bulkHeader}>
          <View style={{ flex: 1 }}>
            <ThemedText font="serif" numberOfLines={1} style={{ fontSize: 17 }}>
              Add to {folder.name}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
              {checked.size} selected
            </ThemedText>
          </View>
          <Pressable
            onPress={() => onConfirm([...checked])}
            style={[styles.sheetBtn, styles.sheetBtnPrimary, { backgroundColor: theme.text }]}>
            <ThemedText style={{ fontSize: 14, color: theme.background }}>Confirm</ThemedText>
          </Pressable>
        </View>

        <FlatList
          data={ordered}
          keyExtractor={(item) => item.id}
          style={styles.bulkList}
          renderItem={({ item }) => {
            const on = checked.has(item.id);
            return (
              <Pressable
                onPress={() => toggle(item.id)}
                style={[styles.bulkRow, { borderBottomColor: theme.hairline }]}>
                <SymbolView
                  name={on ? 'checkmark.circle.fill' : 'circle'}
                  size={20}
                  tintColor={on ? theme.text : theme.textSecondary}
                />
                <ContactTile contact={item} variant="compact" />
                <View style={styles.listText}>
                  <ThemedText font="serif" numberOfLines={1} style={{ fontSize: 14 }}>
                    {item.fields.fullName}
                  </ThemedText>
                  <ThemedText
                    numberOfLines={1}
                    style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
                    {topLabel(item)} · {roleLine(item)}
                  </ThemedText>
                </View>
                {item.folderId && item.folderId !== folder.id && (
                  <SymbolView name="folder" size={12} tintColor={theme.textSecondary} />
                )}
              </Pressable>
            );
          }}
        />
      </Pressable>
    </Pressable>
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
  addChip: { borderWidth: StyleSheet.hairlineWidth, backgroundColor: 'transparent' },
  sortBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + Spacing.xxs,
    borderRadius: 10,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  addToFolderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    paddingHorizontal: Spacing.sm + Spacing.xxs,
    paddingVertical: Spacing.xs,
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth,
  },
  folderPickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  folderPill: {
    paddingHorizontal: Spacing.md - Spacing.xxs,
    paddingVertical: Spacing.xs + Spacing.xxs,
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth,
  },
  newFolderInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md - Spacing.xxs,
    paddingVertical: Spacing.xs + Spacing.xxs,
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bulkSheet: {
    maxHeight: '82%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.lg,
  },
  bulkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  bulkList: { paddingHorizontal: Spacing.lg },
  bulkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm + Spacing.xxs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
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

  // Plain full-screen overlay + KeyboardAvoidingView, matching the editor's
  // move away from Modal (commit 6cf1ca9).
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetWrap: { width: '100%' },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  sheetInput: {
    marginTop: Spacing.md,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + Spacing.xxs,
    fontSize: 15,
  },
  noteInput: {
    marginTop: Spacing.xs,
    borderRadius: 10,
    padding: Spacing.md,
    fontSize: 14,
    minHeight: 84,
    textAlignVertical: 'top',
  },
  sheetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  sheetBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + Spacing.xxs,
    borderRadius: 10,
  },
  sheetBtnPrimary: { alignItems: 'center', justifyContent: 'center' },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
  },
});
