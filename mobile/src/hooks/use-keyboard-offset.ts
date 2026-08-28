import { useEffect, useRef } from 'react';
import { Animated, Keyboard, Platform } from 'react-native';

/**
 * Animates to `-shiftAmount` while the keyboard is visible and back to 0
 * when it hides -- returns an Animated.Value ready to drop straight into a
 * `translateY` transform. KeyboardAvoidingView's `padding` behavior was
 * tried first for the editor screen, but it works by shrinking whichever
 * child is `flex: 1` (the card) to make room -- fine for a form, wrong here
 * since the card is a fixed design the user is styling, not something that
 * should visually shrink while editing. Translating the whole screen up by
 * a fixed amount instead keeps the card at full size.
 */
export function useKeyboardOffset(shiftAmount: number) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(translateY, {
        toValue: -shiftAmount,
        duration: Platform.OS === 'ios' ? e.duration || 250 : 200,
        useNativeDriver: true,
      }).start();
    });
    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(translateY, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? e.duration || 250 : 200,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [translateY, shiftAmount]);

  return translateY;
}
