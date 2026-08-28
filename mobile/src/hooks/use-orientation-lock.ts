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
