/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, type ThemeColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemeName = 'light' | 'dark';

export function useThemeName(): ThemeName {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}

/** The active palette. Dark is the product's hero presentation. */
export function useTheme() {
  return Colors[useThemeName()];
}

/** Resolve a single token, for the many places that need just one color. */
export function useThemeColor(token: ThemeColor): string {
  return useTheme()[token];
}
