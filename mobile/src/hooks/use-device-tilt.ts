import { DeviceMotion } from 'expo-sensors';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

/**
 * Single shared tilt source. CardFlipContainer and CardMaterial both read
 * from one instance of this so the glare layer and the flip's light-glare
 * pass react to the same physical tilt rather than drifting out of sync.
 *
 * beta/gamma from DeviceMotion are defined relative to the phone's physical
 * portrait frame, not the visual orientation on screen. This screen is
 * locked to landscape but expo-screen-orientation's LANDSCAPE lock allows
 * either LANDSCAPE_LEFT or LANDSCAPE_RIGHT, and the two are 180° rotations
 * of each other, so the physical axes need to be remapped (swapped, and
 * one negated) based on which one is actually active or the tilt direction
 * comes out backwards/on the wrong axis depending on how the phone is held.
 *
 * The values returned here are screen-relative: beta = lean toward/away
 * from the viewer, gamma = roll left/right — matching what CardFlipContainer
 * and CardMaterial expect regardless of physical rotation.
 */
export function useDeviceTilt() {
  const beta = useSharedValue(0); // lean toward/away from viewer, degrees
  const gamma = useSharedValue(0); // roll left/right, degrees

  useEffect(() => {
    // DeviceMotion has no web implementation, so addListener isn't a
    // function there — skip tracking and leave beta/gamma at rest (0).
    if (Platform.OS === 'web') return;

    DeviceMotion.setUpdateInterval(16);

    let orientation: ScreenOrientation.Orientation | null = null;
    let motionSubscription: { remove: () => void } | null = null;
    let cancelled = false;

    // Zero tilt is a physically flat, level phone (gravity-relative), not
    // whatever pose the phone happens to be held at when tracking starts —
    // DeviceMotion's raw beta/gamma are already gravity-relative, so no
    // baseline/calibration step is needed.
    function applyMeasurement(rawBeta: number, rawGamma: number) {
      // In landscape, the phone's physical long axis (portrait gamma) is
      // the screen's toward/away lean, and the physical short axis
      // (portrait beta) is the screen's left-right roll. LANDSCAPE_RIGHT is
      // rotated 180° from LANDSCAPE_LEFT, so both axes flip sign again there.
      // Portrait/unknown orientations aren't supported by this screen (it's
      // locked to landscape) and fall back to the LANDSCAPE_LEFT mapping.
      switch (orientation) {
        case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
          beta.value = -rawGamma;
          gamma.value = rawBeta;
          break;
        case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
        default:
          beta.value = rawGamma;
          gamma.value = -rawBeta;
          break;
      }
    }

    function startTracking() {
      if (cancelled) return;
      motionSubscription = DeviceMotion.addListener((measurement) => {
        if (!measurement.rotation) return;
        const rawBeta = measurement.rotation.beta * (180 / Math.PI);
        const rawGamma = measurement.rotation.gamma * (180 / Math.PI);
        applyMeasurement(rawBeta, rawGamma);
      });
    }

    // Resolve the current orientation before attaching the motion listener
    // so no sample is ever mapped with a guessed orientation.
    ScreenOrientation.getOrientationAsync().then((current) => {
      if (cancelled) return;
      orientation = current;
      startTracking();
    });
    const orientationSubscription = ScreenOrientation.addOrientationChangeListener((event) => {
      const next = event.orientationInfo.orientation;
      // This screen is locked to landscape -- a transient PORTRAIT_UP/DOWN
      // report (e.g. iOS's own orientation blip while a camera session
      // above this screen tears down) isn't a real rotation to remap
      // against, and applying it snaps the tilt mapping to the wrong
      // axis/sign for a frame before the real LANDSCAPE event corrects it.
      if (
        next !== ScreenOrientation.Orientation.LANDSCAPE_LEFT &&
        next !== ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      ) {
        return;
      }
      orientation = next;
    });

    return () => {
      cancelled = true;
      motionSubscription?.remove();
      orientationSubscription.remove();
    };
  }, [beta, gamma]);

  return { beta, gamma };
}
