# Card Editor Specification

## Overview
The Editor screen is where users customize the front and back of their business card. To maintain the "American Psycho" premium aesthetic, the editing experience must be completely unobtrusive. We want to avoid clunky, massive web forms. Instead, it should be a tactile, WYSIWYG (What You See Is What You Get) experience.

## The WYSIWYG Experience
1. **Direct Manipulation:** 
   - The user sees their card occupying the center of the screen, looking exactly as it would when shared.
   - Tapping directly on a piece of text (e.g., their name or title) turns it into an active input field, allowing them to type directly onto the card.
2. **Invisible UI:**
   - When not actively editing a field, no borders, outlines, or input boxes are visible around the text. The UI gets completely out of the way.

## Customization Controls
When a user interacts with the card, a sleek bottom sheet or floating toolbar smoothly slides into view to offer customization options.

### Global Card Settings & Personalization
A single, minimalist floating button (perhaps a subtle gear or palette icon) sits in the bottom corner of the screen to open the global card settings. This is where users can break out of the default minimalist aesthetic to fit their niche:

- **Layout Templates:** Choose from different structural blueprints (e.g., "The Classic" centered, "The Creative" asymmetrical, "The Dev" terminal-style).
- **Backgrounds & Textures:** 
  - Curated premium paper textures ("Bone", "Silian Rail").
  - Modern alternatives like mesh gradients, glassmorphism, or custom art/photo uploads.
- **Card Materials & Finishes:** Toggle 3D effects tied to the device gyroscope (e.g., Holographic foil shimmer, matte vs. glossy reflections, embossed text).
- **Global Typography & Accents:** Select a base font family and pick a primary brand accent color to replace the default black ink.

> **As built:** the gear opens a **Card Style** bottom sheet (`GlobalSettingsSheet`) with four controls: Layout (template chips), Material (a row showing the current material + collection, which opens its own sheet), Font, and Font Color. Materials are the cosmetic economy, so they get a dedicated **Material** sheet (`MaterialsSheet`) rather than a chip row: swatches are real business-card-ratio gradient previews grouped by collection (Classics → Modern Executives → Creatives & Techies → Avant-Garde), each collection tagged Free / Premium. See the [Materials Catalog](./MATERIALS_CATALOG.md#implementation-status) for what the material actually drives on the card and what's still stubbed (tier gating, persistence). Every `EditorSheet` closes via a **Done** button in its header or by tapping the scrim; the sheet is inset from the device's side notch / home indicator since the editor is landscape-locked. Digital Perks (audio snippet) is not built.
- **Digital Perks:** Add an interactive audio snippet button to the card (reminiscent of MySpace profile songs) for an elevator pitch or name pronunciation.

### Element-Specific Settings
When a specific text block (like the Name or Job Title) is tapped, the bottom sheet updates to offer:
- **Font Weight & Style:** Regular, Bold, Italic, All-Caps.
- **Alignment & Kerning:** A slider to adjust letter spacing (kerning) so the user can achieve that perfect, agonizing visual balance Patrick Bateman would be proud of.
- **Visibility:** A toggle to hide a field (e.g., hiding the Fax number if they don't want it).

## Editing the Back (Links)
- A "Flip Card" gesture or button allows the user to turn the card over in the editor.
- The user can tap an elegant `+` button to add a new link.
- They enter the Platform Name and the URL.
- The app automatically generates the QR code and aligns it beautifully on the back of the card. They can drag to reorder the QR codes/links.
