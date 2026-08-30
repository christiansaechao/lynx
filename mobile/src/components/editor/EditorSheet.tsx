import { PropsWithChildren, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Motion, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Slack over the exit duration before force-unmounting, so the timer never
// beats an animation that is about to finish on its own.
const EXIT_GRACE_MS = 80;

interface EditorSheetProps extends PropsWithChildren {
  title: string;
  visible: boolean;
  onClose: () => void;
  /**
   * When true the sheet grows to its full `maxHeight` and the content area
   * fills that space (children can `flex: 1` into it) rather than the
   * sheet shrinking to fit its content. Use for sheets whose one control
   * should occupy whatever room is available -- e.g. the colour picker.
   */
  fillHeight?: boolean;
}

export function EditorSheet({ title, visible, onClose, children, fillHeight = false }: EditorSheetProps) {
  // The sheet outlives `visible` by one animation so SlideOutDown has
  // something to play against.
  const [mounted, setMounted] = useState(visible);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const keyboard = useAnimatedKeyboard();

  // Lift the whole sheet by the keyboard's height so the caret and the row
  // being typed into never sit behind it. `height` is 0 when the keyboard
  // is closed, so this is a no-op the rest of the time.
  const keyboardStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboard.height.value,
  }));

  // While the keyboard is up the sheet's own bottom inset (home indicator /
  // Spacing.lg) is just a gap between the last field and the keyboard. Drop
  // it as the keyboard rises so the sheet's bottom edge hugs the keyboard.
  const sheetPadStyle = useAnimatedStyle(() => {
    const rest = Math.max(insets.bottom, Spacing.lg);
    const open = keyboard.height.value > 0;
    return { paddingBottom: open ? Spacing.sm : rest };
  });

  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }

    // Unmounting used to be driven solely by SlideOutDown's withCallback.
    // That callback does not fire if the exit is interrupted — or if the
    // screen it lives on is navigated away from mid-animation — and the
    // sheet then stays mounted forever with its full-screen scrim over
    // everything, which makes the app untappable. The timer is the
    // authority; the callback below just gets us there sooner when the
    // animation does finish cleanly.
    const timeout = setTimeout(() => setMounted(false), Motion.durations.base + EXIT_GRACE_MS);
    return () => clearTimeout(timeout);
  }, [visible]);

  if (!mounted) return null;

  return (
    // A plain full-screen overlay -- NOT an RN <Modal>. Modal spins up its
    // own iOS view controller whose supportedInterfaceOrientations forced
    // the whole window to portrait the instant a sheet opened. This View is
    // just absolutely positioned over the editor screen, so it inherits the
    // current orientation and has no native window of its own. It's rendered
    // where the sheet component is mounted (inside the editor screen), which
    // already fills the screen, so screen-edge coordinates line up.
    <Animated.View style={StyleSheet.absoluteFill}>
      <Animated.View
        entering={FadeIn.duration(Motion.durations.fast)}
        exiting={FadeOut.duration(Motion.durations.base)}
        style={StyleSheet.absoluteFill}>
        <Pressable style={styles.scrim} onPress={onClose} />
      </Animated.View>
      <Animated.View
        entering={SlideInDown.duration(Motion.durations.base)}
        exiting={SlideOutDown.duration(Motion.durations.base).withCallback((finished) => {
          if (finished) runOnJS(setMounted)(false);
        })}
        style={[
          styles.sheetWrap,
          // Inset clear of the notch / Dynamic Island and home indicator,
          // which sit on the device's left/right edges in landscape.
          { paddingLeft: insets.left, paddingRight: insets.right, paddingTop: insets.top + Spacing.md },
          keyboardStyle,
        ]}>
        <Animated.View
          // Pinned top-to-bottom so the sheet fills at most the space above
          // the home indicator and never pushes its header off the top --
          // content beyond the maxHeight cap scrolls inside the ScrollView.
          style={[
            styles.sheet,
            { backgroundColor: theme.backgroundElement },
            fillHeight && styles.sheetFill,
            sheetPadStyle,
          ]}>
          <Pressable style={styles.header} onPress={onClose} hitSlop={Spacing.sm}>
            <ThemedText variant="label">{title}</ThemedText>
            <ThemedText variant="button">Done</ThemedText>
          </Pressable>
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={!fillHeight}
            style={[styles.scroll, fillHeight && styles.scrollFill]}
            contentContainerStyle={fillHeight ? styles.scrollContentFill : undefined}>
            {children}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Fills its absoluteFill parent. Without flex the Pressable collapses to
  // zero size: the dim still paints from the parent, but tapping it never
  // hits anything, so tap-outside-to-close silently does nothing.
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    // Anchor the sheet to the bottom; it grows upward only as far as the
    // top inset applied inline, then its own ScrollView takes over.
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Spacing.md,
    borderTopRightRadius: Spacing.md,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    // Cap growth so a tall sheet stops well short of the card above it,
    // rather than filling the whole area between the notch and the bottom.
    maxHeight: '75%',
  },
  // fillHeight: pin the sheet AT the cap so the content region below has a
  // fixed height for its children to flex into.
  sheetFill: {
    height: '75%',
  },
  scroll: {
    // flexGrow: 0 keeps the ScrollView (and its parent sheet) sized to its
    // content up to the sheet's maxHeight, rather than always stretching to
    // fill it -- a short sheet (e.g. "Add Link") should stay compact.
    flexGrow: 0,
    flexShrink: 1,
    marginTop: Spacing.md,
  },
  // fillHeight: let the ScrollView take all the room the pinned sheet gives
  // it, and stretch its content container to match so children can flex.
  scrollFill: {
    flexGrow: 1,
  },
  scrollContentFill: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
});
