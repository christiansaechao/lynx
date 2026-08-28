---
name: Lynx
colors:
  surface: '#121316'
  surface-dim: '#121316'
  surface-bright: '#38393c'
  surface-container-lowest: '#0d0e11'
  surface-container-low: '#1a1b1e'
  surface-container: '#1e2022'
  surface-container-high: '#292a2d'
  surface-container-highest: '#343538'
  on-surface: '#e3e2e6'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e3e2e6'
  inverse-on-surface: '#2f3033'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c3c7cd'
  on-secondary: '#2c3136'
  secondary-container: '#45494f'
  on-secondary-container: '#b5b9bf'
  tertiary: '#ffffff'
  on-tertiary: '#30312e'
  tertiary-container: '#e3e3de'
  on-tertiary-container: '#646561'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#dfe3e9'
  secondary-fixed-dim: '#c3c7cd'
  on-secondary-fixed: '#171c21'
  on-secondary-fixed-variant: '#43474c'
  tertiary-fixed: '#e3e3de'
  tertiary-fixed-dim: '#c7c7c2'
  on-tertiary-fixed: '#1b1c19'
  on-tertiary-fixed-variant: '#464744'
  background: '#121316'
  on-background: '#e3e2e6'
  surface-variant: '#343538'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 52px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.15em
spacing:
  xs: 2px
  sm: 4px
  md: 8px
  lg: 16px
  xl: 24px
  xxl: 32px
  huge: 64px
---

## Brand & Style

This design system embodies an aesthetic of obsessive precision and cold elegance. It is a high-modernist interpretation of corporate vanity, characterized by a stark monochromatic palette and an uncompromising commitment to hierarchy. 

The visual style is **Minimalist** with a **Tactile** focus on material representation. It avoids the digital "softness" of contemporary mobile apps in favor of sharp edges, vast negative space, and the physical weight of simulated paper stocks. The UI exists only to frame the business cards themselves; it is silent, expensive, and intimidatingly clean.

**Design Principles:**
- **Absolute Sharpness:** No rounded corners or soft blurs.
- **Materiality:** Depth is communicated through physical material properties (color, grain, and "bone" hues) rather than digital shadows.
- **Typography as Interface:** The layout is driven by type weight and placement, not decorative containers.

## Colors

The palette is strictly controlled to maintain a high-contrast, editorial atmosphere. All functional UI elements remain in the grayscale spectrum, allowing the "Bone" material of the default card and subsequent user-defined materials to provide the only warmth in the interface.

- **Primary (#FFFFFF):** Reserved for high-priority headings and active states.
- **Secondary (#B0B4BA):** Used for supporting text, labels, and inactive icons.
- **Background (#000000):** A pure, deep black to provide a void-like backdrop for material cards.
- **Elements (#212225):** Used for subtle structural separators and button backgrounds.
- **Bone (#FBFAF5 to #E9E3D6):** The primary material color for the default business card. This is never used for UI buttons, only for the "objects" within the app.

## Typography

The typography strategy pits the classical sophistication of **EB Garamond** against the clinical precision of **Hanken Grotesk**.

- **EB Garamond:** Used for logos, names on cards, and primary page headers. It should feel literary and established.
- **Hanken Grotesk:** Used for all functional UI, contact details, and metadata. It should feel like a high-end architectural blueprint—functional and neutral.

Large display type should utilize subtle negative letter-spacing, while small labels should be tracked out aggressively for an expensive, airy feel.

## Layout & Spacing

This design system utilizes a rigid **Fixed Grid** model. The layout is obsessively structured around an 8pt rhythmic scale, with a preference for extreme white space (the "huge" 64px unit) to emphasize the isolation of elements.

**Layout Rules:**
- **Margins:** 32px horizontal margins on all mobile screens.
- **Gutter:** 16px fixed gutters for list items.
- **Alignment:** Content is predominantly left-aligned to mirror a formal letterhead.
- **Scaling:** On tablet and desktop, the central "Card View" remains a fixed 600px width, floating in a pure black void to maintain the focus on the card's physical dimensions.

## Elevation & Depth

Standard digital elevation (shadows, blurs) is strictly forbidden. Depth is achieved through **Tonal Layering** and physical borders.

1. **The Void (Level 0):** Pure #000000 background.
2. **The Surface (Level 1):** #212225 used for input fields or secondary buttons. No shadow.
3. **The Object (Level 2):** The business card itself. It is defined by its material color (Bone) and a razor-sharp 1px inner stroke to simulate the edge of cardstock. 

To suggest a "stack" of cards, use 1px offsets of the Bone material rather than shadows. This creates a staggered, mechanical look.

## Shapes

There are no rounded corners in this design system. Every element—buttons, cards, input fields, and selection states—must have a **0px radius (Sharp)**. 

The sharpness communicates a sense of danger and precision. The only curves permitted are within the letterforms of the typography.

## Components

**Buttons**
- **Primary:** White background, black Hanken Grotesk text, uppercase, bold. No rounding.
- **Secondary:** Transparent with a 1px White border.
- **Text Buttons:** Underlined secondary text, no background.

**Cards (The "Object")**
- The central component of the app. It must use the "Bone" color (#FBFAF5) with a subtle texture overlay to mimic 100lb cardstock. Text on the card should be EB Garamond, rendered in a slightly off-black (#1A1A1A) to simulate ink.

**Input Fields**
- 1px #212225 border on all four sides. On focus, the border turns White. Labels are always positioned above the field in `label-caps`.

**Lists & Dividers**
- Lists are separated by 1px #212225 lines. No chevron icons for navigation; use spatial transition or simple text weight changes to indicate clickability.

**Selection Controls**
- Checkboxes and Radio buttons are sharp squares. A "selected" state is a solid white fill or a simple "X" mark. Avoid "Check" marks which feel too consumer-grade.