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
 *
 * `enabled` (default true) lets a caller suppress the AppState "active"
 * relock without unmounting the hook. scan.tsx needs this: closing the
 * camera (CameraView unmount, permission/session teardown) can itself
 * trigger a spurious AppState "active" blip on iOS, and if that lands
 * after the screen below (card.tsx) has already re-locked LANDSCAPE on
 * focus, this hook's own listener would relock PORTRAIT_UP right back on
 * top of it -- a third, out-of-order lock call fighting the other two.
 */
export function useOrientationLock(lock: ScreenOrientation.OrientationLock, enabled: boolean = true) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const apply = (reason: string) => {
      console.log(`[orientation] lockAsync(${lock}) requested -- ${reason}`);
      ScreenOrientation.lockAsync(lock).then(() => {
        console.log(`[orientation] lockAsync(${lock}) settled -- ${reason}`);
        if (!cancelled) setReady(true);
      });
    };

    apply('mount/lock-change');

    const subscription = AppState.addEventListener('change', (state) => {
      console.log(`[orientation] AppState changed to ${state} (enabled=${enabled})`);
      if (state === 'active') apply('AppState active');
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [lock, enabled]);

  return ready;
}
