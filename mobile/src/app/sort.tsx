import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContactTile } from '@/components/ContactTile';
import { ThemedText } from '@/components/themed-text';
import { Motion, Spacing } from '@/constants/theme';
import { useOrientationLock } from '@/hooks/use-orientation-lock';
import { useTheme } from '@/hooks/use-theme';
import { useRolodexStore } from '@/store/useRolodexStore';
import type { ContactCard } from '@/types/card';

/** Horizontal / vertical travel past which a release commits the swipe. */
const SWIPE_X = 110;
const SWIPE_Y = 130;

type Outcome = { starred?: boolean; note?: string | null };

/**
 * The Post-Meetup Sorting screen (docs/ROLODEX_EXPERIENCE.md §2). A
 * Tinder-style stack over every still-unsorted collected card:
 *   - swipe LEFT  -> file to the event folder as-is
 *   - swipe RIGHT -> star & prioritize, then file
 *   - swipe UP    -> pause, add a private note, then file (starred)
 * Each decision stamps `sortedAt` via useRolodexStore.sortContact, so the
 * card leaves the stack for good.
 */
export default function SortScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  useOrientationLock(ScreenOrientation.OrientationLock.PORTRAIT_UP);

  const contacts = useRolodexStore((s) => s.contacts);
  const sortContact = useRolodexStore((s) => s.sortContact);

  // Frozen once, on mount: the queue is the set of cards unsorted when the
  // user opened the screen. Sorting one mutates the store, so reading
  // `contacts` live here would re-index the stack mid-swipe.
  const [queue] = useState<ContactCard[]>(() => contacts.filter((c) => !c.sortedAt));
  const [index, setIndex] = useState(0);
  const [noteFor, setNoteFor] = useState<ContactCard | null>(null);

  const total = queue.length;
  const current = queue[index] ?? null;
  const next = queue[index + 1] ?? null;
  const sortedThisSession = index;

  const advance = (outcome: Outcome) => {
    const card = queue[index];
    if (card) sortContact(card.id, outcome);
    setIndex((i) => i + 1);
  };

  if (total === 0 || index >= total) {
    return (
      <DoneState
        count={total}
        sorted={sortedThisSession || total}
        onClose={() => router.back()}
      />
    );
  }

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top + Spacing.md,
          paddingBottom: insets.bottom + Spacing.lg,
        },
      ]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={Spacing.md} style={styles.closeHit}>
          <SymbolView name="xmark" size={18} tintColor={theme.text} />
        </Pressable>
        <ThemedText font="serif" style={{ fontSize: 18 }}>
          {index + 1} of {total}
        </ThemedText>
        <View style={styles.closeHit} />
      </View>

      <View style={styles.stage}>
        {next && (
          <View style={styles.behind} pointerEvents="none">
            <BigCard contact={next} />
          </View>
        )}
        <SwipeCard
          key={current!.id}
          contact={current!}
          onLeft={() => advance({})}
          onRight={() => advance({ starred: true })}
          onUp={() => setNoteFor(current)}
        />
      </View>

      <View style={styles.legend}>
        <LegendItem icon="arrow.left" label="File" theme={theme} />
        <LegendItem icon="star.fill" label="Star" theme={theme} />
        <LegendItem icon="arrow.up" label="Note" theme={theme} />
      </View>

      {noteFor && (
        <NoteOverlay
          contact={noteFor}
          onCancel={() => setNoteFor(null)}
          onSave={(note) => {
            setNoteFor(null);
            advance({ starred: true, note });
          }}
        />
      )}
    </View>
  );
}

function SwipeCard({
  contact,
  onLeft,
  onRight,
  onUp,
}: {
  contact: ContactCard;
  onLeft: () => void;
  onRight: () => void;
  onUp: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const fling = (toX: number, toY: number, cb: () => void) => {
    'worklet';
    x.value = withTiming(toX, { duration: 180 });
    y.value = withTiming(toY, { duration: 180 }, (done) => {
      if (done) runOnJS(cb)();
    });
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY;
    })
    .onEnd((e) => {
      const up = e.translationY < -SWIPE_Y && Math.abs(e.translationX) < SWIPE_X;
      if (up) {
        // Up pauses for the note editor -- spring back to center so the
        // card is still there when the overlay dismisses without a note.
        x.value = withSpring(0, Motion.spring);
        y.value = withSpring(0, Motion.spring);
        runOnJS(onUp)();
        return;
      }
      if (e.translationX > SWIPE_X) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        fling(width * 1.5, e.translationY, onRight);
        return;
      }
      if (e.translationX < -SWIPE_X) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        fling(-width * 1.5, e.translationY, onLeft);
        return;
      }
      x.value = withSpring(0, Motion.spring);
      y.value = withSpring(0, Motion.spring);
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotateZ: `${interpolate(x.value, [-width, width], [-12, 12])}deg` },
    ],
  }));

  const starStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [20, SWIPE_X], [0, 1], 'clamp'),
  }));
  const fileStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-SWIPE_X, -20], [1, 0], 'clamp'),
  }));
  const noteStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [-SWIPE_Y, -30], [1, 0], 'clamp'),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.swipe, { maxHeight: height * 0.62 }, cardStyle]}>
        <BigCard contact={contact} />
        <Animated.View style={[styles.stamp, styles.stampRight, starStyle]}>
          <ThemedText style={styles.stampText}>STAR</ThemedText>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampLeft, fileStyle]}>
          <ThemedText style={styles.stampText}>FILE</ThemedText>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampUp, noteStyle]}>
          <ThemedText style={styles.stampText}>NOTE</ThemedText>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

function BigCard({ contact }: { contact: ContactCard }) {
  return (
    <View style={styles.bigCard}>
      <ContactTile contact={contact} />
    </View>
  );
}

function LegendItem({
  icon,
  label,
  theme,
}: {
  icon: SymbolViewProps['name'];
  label: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={styles.legendItem}>
      <SymbolView name={icon} size={13} tintColor={theme.textSecondary} />
      <ThemedText style={{ fontSize: 11, color: theme.textSecondary }}>{label}</ThemedText>
    </View>
  );
}

function NoteOverlay({
  contact,
  onCancel,
  onSave,
}: {
  contact: ContactCard;
  onCancel: () => void;
  onSave: (note: string | null) => void;
}) {
  const theme = useTheme();
  const [draft, setDraft] = useState('');
  const commit = () => {
    const t = draft.trim();
    onSave(t.length ? t : null);
  };
  return (
    <Pressable style={styles.scrim} onPress={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.background, borderColor: theme.hairline }]}
          onPress={() => {}}>
          <ThemedText font="serif" numberOfLines={1} style={{ fontSize: 17 }}>
            {contact.fields.fullName}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: Spacing.xs }}>
            Adds a private note and stars the contact.
          </ThemedText>
          <TextInput
            autoFocus
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
            <Pressable onPress={onCancel} style={styles.sheetBtn}>
              <ThemedText style={{ fontSize: 14, color: theme.textSecondary }}>Cancel</ThemedText>
            </Pressable>
            <Pressable
              onPress={commit}
              style={[styles.sheetBtn, styles.sheetBtnPrimary, { backgroundColor: theme.text }]}>
              <ThemedText style={{ fontSize: 14, color: theme.background }}>Save & file</ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Pressable>
  );
}

function DoneState({
  count,
  sorted,
  onClose,
}: {
  count: number;
  sorted: number;
  onClose: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.root,
        styles.doneWrap,
        { backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      <SymbolView name="checkmark.circle" size={44} tintColor={theme.text} />
      <ThemedText font="serif" style={{ fontSize: 20, marginTop: Spacing.md }}>
        {count === 0 ? 'Nothing to sort' : 'Stack cleared'}
      </ThemedText>
      <ThemedText
        style={{
          fontSize: 13,
          color: theme.textSecondary,
          marginTop: Spacing.sm,
          textAlign: 'center',
          maxWidth: 260,
        }}>
        {count === 0
          ? 'New connections show up here after you collect them.'
          : `You sorted ${sorted} ${sorted === 1 ? 'connection' : 'connections'}.`}
      </ThemedText>
      <Pressable
        onPress={onClose}
        style={[styles.doneBtn, { backgroundColor: theme.text }]}>
        <ThemedText style={{ fontSize: 14, color: theme.background }}>Done</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  closeHit: { padding: Spacing.xs, minWidth: 32 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  behind: { position: 'absolute', transform: [{ scale: 0.94 }], opacity: 0.55 },
  swipe: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  bigCard: { width: '100%' },
  stamp: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
  },
  stampText: { fontSize: 22, fontWeight: '800', letterSpacing: 2, color: '#fff' },
  stampLeft: { top: 24, right: 20, borderColor: '#fff', transform: [{ rotateZ: '14deg' }] },
  stampRight: { top: 24, left: 20, borderColor: '#fff', transform: [{ rotateZ: '-14deg' }] },
  stampUp: { bottom: 24, alignSelf: 'center', borderColor: '#fff' },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingTop: Spacing.md,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },

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
  },
  noteInput: {
    marginTop: Spacing.md,
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

  doneWrap: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  doneBtn: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 10,
  },
});
