import { SymbolView } from 'expo-symbols';
import { Platform, StyleSheet, Text } from 'react-native';

import { platformLettermark, platformSymbol } from '@/constants/linkPlatforms';

interface LinkGlyphProps {
  platform: string;
  size: number;
  color: string;
}

/**
 * One monochrome mark in the App Grid. SF Symbols are iOS-only, so every
 * other platform (and any unmapped platform name) renders the lettermark
 * instead — the grid stays visually consistent either way.
 */
export function LinkGlyph({ platform, size, color }: LinkGlyphProps) {
  const symbol = Platform.OS === 'ios' ? platformSymbol(platform) : null;

  if (symbol) {
    return <SymbolView name={symbol as never} size={size} weight="light" tintColor={color} />;
  }

  return (
    <Text
      allowFontScaling={false}
      style={[
        styles.lettermark,
        // Track the requested glyph size so lettermarks and symbols sit on
        // the same optical baseline within a grid cell.
        { fontSize: size * 0.5, lineHeight: size, color },
      ]}>
      {platformLettermark(platform)}
    </Text>
  );
}

const styles = StyleSheet.create({
  lettermark: {
    fontWeight: '400',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
