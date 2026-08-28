# Card Materials: Technical Implementation

## Overview
The [Materials & Textures Catalog](./MATERIALS_CATALOG.md) promises materials that feel tactile and reactive — shimmering, shifting, catching light as the phone tilts. This document defines how that "digital physics" is actually built, so the reactive feel is real rather than a static image pretending to be reactive.

The core idea borrows from how mobile card-pack-opening apps (e.g. Pokémon TCG Pocket) fake holographic foil: gyroscope input drives a lighting/glare layer in real time. Lynx doesn't need a full game engine to get this — the surface being rendered is a single flat card, not a tearing pack with a particle-heavy reveal sequence, so React Native Reanimated (already in the [Architecture](./ARCHITECTURE.md) stack) covers most of it.

## Phase 1 (MVP): Reanimated-Driven Layers — **implemented**
This is the default implementation for every material in the Classics, Modern Executives, and Creatives tiers of the catalog — no shader code required.

**Status:** wired up. `CardMaterial` (`mobile/src/components/CardMaterial.tsx`) takes a `materialId`, renders the base gradient plus a single tilt-bound glare layer, and reads the glare tint and rest/tilt opacity from the material's `glare` config in `constants/materials.ts`. `useCardTemplateStyle` resolves the material's ink colors and a `relief`-driven text shadow (the Phase 1 stand-in for true embossing/debossing). The card back passes `tilt={null}` and gets the material's static rest sheen. Selection is surfaced through the editor's Card Style sheet → dedicated Material sheet (see [Editor Spec](./EDITOR_SPEC.md)). Not yet done: no runtime persistence of the choice, and no shader work — see below.

1. **Tilt input:** `expo-sensors`' Gyroscope/Accelerometer feeds the device's tilt into a Reanimated shared value. Because it's a shared value, the tilt updates drive the UI thread directly with no JS-thread re-render cost — the same mechanism that will power **the flip** animation.
2. **Base layer:** Each material's static look — Bone's paper grain, Obsidian's dark gradient, Holographic Prism's rainbow gradient — is a `LinearGradient`/`View` background, per the catalog's descriptions.
3. **Reactive layer:** A semi-transparent glare/highlight gradient sits on top, its position and angle bound to the tilt shared value. This single layer produces the "shifts as you tilt" effect for most materials in the catalog.
4. **Holographic Prism, specifically:** the rainbow `LinearGradient`'s angle/offset is bound directly to tilt, which alone gets the "shifting iridescent" look described in the catalog without true per-pixel lighting.

## Phase 2 (Premium Fidelity): Skia Shaders
Reserved for materials where the layered-gradient approach in Phase 1 isn't convincing enough — most notably **Obsidian Matte**'s debossed text (which needs to look genuinely pressed into the surface, not just shadowed) and **Carbon Fiber Weave**'s shimmer.

- `react-native-skia` exposes GPU shaders via SkSL, enabling true per-pixel lighting math: Fresnel/rim-lighting effects, and normal-map-based embossed/debossed text that responds to a light-direction uniform derived from the same tilt value used in Phase 1.
- **Why this is Phase 2, not MVP:** it's meaningfully more engineering effort than layered gradients, and the fidelity jump is a natural upsell rather than a baseline requirement.

## Tie-in to Monetization
Phase 2's shader-based materials are a natural fit for the premium cosmetic tier described in the [Monetization Strategy](./MONETIZATION_STRATEGY.md): Phase 1 materials (Bone, Silian Rail, and simple gradient-based finishes) ship free/default, while Phase 2 shader-driven materials (true debossed Obsidian, shimmering Carbon Fiber) become the paid microtransaction tier — the fidelity difference is the product, not just a visual toggle.

## Component Ownership
This logic lives in the card materials rendering layer, sitting between `CardFront`/`CardBack` and the raw texture/gradient — see the [Architecture](./ARCHITECTURE.md) doc's Component Structure section. A dedicated `CardMaterial` component should own tilt-input plumbing and per-material rendering, so a material can be swapped at runtime from the Editor's **Card Materials & Finishes** control (per the [Editor Spec](./EDITOR_SPEC.md)) without each card component re-implementing the reactive layer itself.
