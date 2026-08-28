# Premium Materials & Textures Catalog

Because Lynx relies heavily on the "status symbol" aesthetic, the digital materials used for the cards must feel incredibly premium, tactile, and reactive to the phone's 3D physics (gyroscope tilt and light glare). 

Below is the initial catalog of materials users can unlock or select from.

## The Classics (The "American Psycho" Tier)
1. **Bone:** The default. A warm, off-white matte finish with a microscopic, porous paper texture. Text is slightly raised (embossed) with a drop shadow to catch the digital light.
2. **Silian Rail:** A crisp, brilliant, stark white. Features a very subtle, high-end linen crosshatch texture. 

## The Modern Executives (Matte & Metals)
3. **Obsidian Matte (Vantablack):** A completely light-absorbing black material that feels infinitely deep. The text isn't printed; it is *debossed* (pressed inward) using a gloss black finish that only reveals itself when the card is tilted in the light.
4. **Brushed Gunmetal:** A dark, moody metallic grey. Features microscopic horizontal brush strokes that sharply reflect the simulated light glare as the phone rotates.
5. **Anodized Titanium:** Inspired by modern high-end smartphones. A cool, matte metallic finish that looks dense and completely smooth.

## The Creatives & Techies
6. **Frosted Glass (Glassmorphism):** A translucent, icy material. It blurs whatever UI elements are behind the card, giving a highly modern, floating aesthetic. 
7. **Holographic Prism:** A retro-futuristic, highly glossy card. As the user swipes to flip the card, the material reflects iridescent, shifting rainbow gradients (purples, blues, and pinks) just like a rare trading card.
8. **Carbon Fiber Weave:** A high-tech, microscopic woven grid pattern sealed under a glossy digital resin. The weave pattern shimmers dynamically under the 3D light.

## The Avant-Garde
9. **Raw Concrete:** A brutalist aesthetic. Light grey, heavily textured, slightly imperfect, and porous. The text looks like it was spray-stenciled onto a polished concrete floor.
10. **Rose Gold Foil:** A highly reflective, warm, luxurious metallic finish. Perfect for influencers, real estate agents, or lifestyle brands.

---
*Note on Engineering:* These are not just static PNG images. These materials will be built using React Native Reanimated, utilizing normal maps and simulated lighting angles so the texture actually shifts and reacts as the user moves their phone or swipes the card. See [Card Materials: Technical Implementation](./CARD_MATERIALS_IMPLEMENTATION.md) for the full rendering approach.

---

## Implementation Status

All 10 materials are declared in `mobile/src/constants/materials.ts` (`CARD_MATERIALS`), each with its base gradient, glare tint/opacity, ink colors, `relief` (`embossed` / `debossed` / `flat`), collection, and `tier` (`free` / `premium`).

**Done (Phase 1 wiring):**
- `CardMaterial` renders the selected material — base `LinearGradient` plus a tilt-driven glare layer whose tint and opacity range come from the material's `glare` config. Flat faces (the card back, `tilt={null}`) show the material's rest sheen with no motion.
- `useCardTemplateStyle` splits ownership: **material** owns the surface and ink (`background`, `textColor`, `labelColor`, and a `relief`-driven text shadow); **template** owns type layout (`fontFamily`, letter-spacing); the independent Fonts / Font Color axes still override on top.
- `relief` is expressed as a text shadow — embossed = light shadow below the glyph, debossed = dark shadow above, flat = none. (This is the Phase 1 approximation; the true pressed-in look for Obsidian Matte / Carbon Fiber is still Phase 2 Skia work.)
- Editor picker: the **Card Style** sheet shows the current material as a row that opens a dedicated **Material** sheet — swatches are real business-card-ratio gradient previews grouped by collection, each collection tagged Free / Premium.

**Not done yet:**
- **Tier is client-side only.** `tier` lives in `materials.ts`; there is no `materials` table in Supabase and no entitlements/purchases model. Every material is currently selectable regardless of tier — the Free / Premium tags are informational until the payments pass.
- **No persistence.** Picking a material updates the store but is not written back to `cards.material_id`, so it resets on relaunch. The read path (`mapCardRow`) already maps `material_id` in.
- Phase 2 Skia shaders (see the implementation doc) are unstarted.
