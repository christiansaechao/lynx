import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * Holds the screen to `lock` for as long as the screen using it is mounted.
 *
 * A one-shot lockAsync on mount is not enough. The OS drops the lock when
 * the app is backgrounded — on Android the activity is destroyed and
 * recreated on a configuration change, taking the lock with it — so
 * returning to the app leaves it free to rotate. Re-applying whenever the
 * app becomes active again is what actually keeps it locked.
 *
 * Returns true once the lock has been applied at least once. lockAsync
 * resolves only after the OS has really settled the new orientation, so
 * callers that must not lay out or animate against a stale orientation
 * (the welcome sequence on the card screen) can wait on this.
 *
 * Pass `ScreenOrientation.OrientationLock.DEFAULT` to free rotation instead
 * of pinning it -- the editor uses this since which way up you hold the
 * phone doesn't matter while editing fields, and forcing landscape there
 * was the source of the orientation complaints. (`.ALL` is not safe here --
 * it throws on devices whose OS/orientation support list doesn't include
 * every orientation.)
 *
 * This hook only ever applies its lock on mount and on AppState "active" --
 * it does not restore anything on unmount. A screen that sits underneath
 * another screen freeing rotation (e.g. card.tsx under the editor modal)
 * needs to re-apply its own lock itself when it regains focus (see
 * card.tsx's useFocusEffect) rather than relying on the screen above it to
 * restore things on the way out, which produces a double orientation
 * transition during the dismiss animation.
 */
export function useOrientationLock(lock: ScreenOrientation.OrientationLock) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const apply = () => {
      ScreenOrientation.lockAsync(lock).then(() => {
        if (!cancelled) setReady(true);
      });
    };

    apply();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') apply();
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [lock]);

  return ready;
}
