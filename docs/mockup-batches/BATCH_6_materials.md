## LYNX — STYLE CORE (applies to every screen in this batch)

**Product:** Lynx is an electronic business card app for iOS/Android. Users design a beautifully typeset, physically-textured digital card and share it by QR or NFC tap at job fairs and meetups. We are not selling a contact app — we are selling a **digital status symbol**.

**Aesthetic — "American Psycho":** premium, obsessively clean, driven by typography and subtle texture. Restraint above all; whitespace is the primary design element. If a screen looks empty, it is correct. Perfect kerning, exact alignment, generous letter-spacing on small-caps labels. Surfaces carry paper grain, linen, embossing, and light glare — the card reads as a held object, not a rectangle.

**Do NOT include:** bottom tab bars on the card screen, hamburger menus, illustration-heavy empty states, mascots, emoji, bright accent colors as decoration, drop shadows on flat UI, or any "friendly SaaS" voice.

**Wordmark:** `Lynx.` — always with the trailing period, in an elegant high-contrast serif (Garamond/Didot/Canela). Loose, optically balanced kerning. No accompanying icon or symbol.

**App UI palette (strict monochrome — all color comes from card materials, never the interface):**

| Token | Light | Dark |
|---|---|---|
| background | `#FFFFFF` | `#000000` |
| text | `#000000` | `#FFFFFF` |
| textSecondary | `#60646C` | `#B0B4BA` |
| backgroundElement (sheets, inputs, chips) | `#F0F0F3` | `#212225` |
| backgroundSelected (active row) | `#E0E1E6` | `#2E3135` |

**Render all screens in DARK MODE** unless a light variant is explicitly requested.

**Card "Bone" default material:** diagonal gradient `#FBFAF5` → `#E9E3D6`; primary ink `#1C1A14`; secondary ink `#4A463C`; name letter-spacing 0.5; labels all-caps at letter-spacing 2.5.

**Card geometry:** business-card aspect ratio 1.75:1 landscape, corner radius 12–16pt (a real die-cut card, never a pill).

**Spacing scale:** 2 / 4 / 8 / 16 / 24 / 32 / 64 pt, used strictly.

**Motion feel:** tactile and damped, never bouncy. The signature interaction is a realistic 3D flip with a light-glare sweep across the material.

---

# BATCH 6 — The Materials Catalog

Render **each of the 10 materials below as a card face** (business-card ratio 1.75:1, landscape), showing the **tilt/glare state** — these are not static images. Gyroscope tilt drives a glare/highlight layer in real time, so the texture shifts as the phone moves. Use the same dummy content on every card so the material is the only variable:

> PIERCE & PIERCE / **Patrick Bateman** / Vice President / Mergers and Acquisitions

Render 5 per run if needed — Classics + Modern Executives first, then Creatives + Avant-Garde.

## The Classics (free tier)
1. **Bone** *(default)* — warm off-white matte, microscopic porous paper grain. Text slightly **raised/embossed** with a soft drop shadow catching the light. Gradient `#FBFAF5` → `#E9E3D6`, ink `#1C1A14`.
2. **Silian Rail** — crisp, brilliant, stark white with a subtle high-end linen crosshatch.

## The Modern Executives
3. **Obsidian Matte** — completely light-absorbing black, infinitely deep. Text is **debossed** (pressed inward) in a gloss black that only reveals itself on tilt.
4. **Brushed Gunmetal** — dark moody metallic grey, microscopic horizontal brush strokes catching the glare sharply on rotation.
5. **Anodized Titanium** — cool matte metallic, dense and completely smooth.

## The Creatives & Techies
6. **Frosted Glass** — translucent icy glassmorphism; blurs whatever sits behind the card.
7. **Holographic Prism** — glossy retro-futuristic; iridescent shifting rainbow gradients (purple/blue/pink), like a rare trading card.
8. **Carbon Fiber Weave** — microscopic woven grid under glossy digital resin, shimmering under 3D light.

## The Avant-Garde
9. **Raw Concrete** — brutalist, light grey, heavily textured, porous, slightly imperfect. Text looks spray-stenciled.
10. **Rose Gold Foil** — highly reflective, warm, luxurious metallic.
