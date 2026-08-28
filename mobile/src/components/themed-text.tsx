import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { Fonts, Typography, type ThemeColor, type TypographyVariant } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Legacy variant names kept so existing screens keep rendering while the
 * mockup screens migrate to the `Typography` scale via `variant`.
 */
type LegacyType = 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'code';

export type ThemedTextProps = TextProps & {
  /** Token from the app type scale. Takes precedence over `type`. */
  variant?: TypographyVariant;
  type?: LegacyType;
  themeColor?: ThemeColor;
  /** Serif is the brand voice (the wordmark); sans is the UI default. */
  font?: 'sans' | 'serif' | 'mono';
};

export function ThemedText({
  style,
  variant,
  type = 'default',
  themeColor,
  font,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  // `label` is the small-caps treatment — uppercasing is part of the token,
  // so callers never have to remember to pass textTransform alongside it.
  const variantStyle: TextStyle | undefined = variant
    ? {
        ...(Typography[variant] as TextStyle),
        ...(variant === 'label' ? { textTransform: 'uppercase' as const } : null),
        ...(variant === 'wordmark' ? { fontFamily: Fonts?.serif } : null),
      }
    : undefined;

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        font ? { fontFamily: Fonts?.[font] } : null,
        variantStyle ?? styles[type],
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  smallBold: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  default: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  title: { fontSize: 48, fontWeight: '600', lineHeight: 52 },
  subtitle: { fontSize: 32, lineHeight: 44, fontWeight: '600' },
  link: { lineHeight: 30, fontSize: 14 },
  code: { fontFamily: Fonts?.mono, fontWeight: '500', fontSize: 12 },
});
