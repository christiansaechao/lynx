import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';

/**
 * Live OS orientation (portrait vs landscape), not just screen aspect
 * ratio — a tablet in split-screen can have a landscape-shaped window while
 * the device itself is held in portrait, and it's the physical orientation
 * that determines whether a fixed-landscape layout needs its quarter-turn
 * rotation or not. Resolves the current orientation once up front, then
 * stays live via the same listener pattern as use-device-tilt.ts.
 *
 * Unused by CardBack -- it derives isLandscape from its own measured
 * onLayout frame instead, since this hook's OS-level orientation state and
 * that layout state update on different schedules and could disagree
 * while CardBack sits (still mounted) under another screen. Kept here for
 * anything that genuinely needs live OS orientation rather than a
 * particular view's own measured shape.
 */
export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<ScreenOrientation.Orientation | null>(null);

  useEffect(() => {
    let cancelled = false;

    ScreenOrientation.getOrientationAsync().then((current) => {
      if (!cancelled) setOrientation(current);
    });

    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      setOrientation(event.orientationInfo.orientation);
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  const isLandscape =
    orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
    orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

  return { orientation, isLandscape };
}
