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

# BATCH 3 of 5 — The Editor

Design these **5 screens**. The editing experience must be completely unobtrusive — a tactile WYSIWYG surface, never a clunky web form.

### 1. Editor — Resting State (dark)
The card sits center screen looking **exactly** as it will when shared. **Invisible UI:** no borders, outlines, selection handles, or input boxes anywhere. The only affordance is a single minimalist floating gear/palette button in a bottom corner.

### 2. Editor — Direct Manipulation (active edit)
The user has tapped the name directly on the card and it has become editable **in place**, with the keyboard up. The text is being typed onto the card itself — not into a form field elsewhere on screen. Keep the treatment as light as possible: a caret and a hairline, nothing more.

### 3. Global Settings Sheet
A bottom sheet (`#212225`) sliding over the card, containing:
- **Layout Templates** — "The Classic" (centered), "The Creative" (asymmetrical), "The Dev" (terminal/monospace); also offered as one-tap presets **"The Bateman"** and **"The Techie"**
- **Backgrounds & Textures** — curated paper textures, mesh gradients, glassmorphism, custom photo upload
- **Card Materials & Finishes** — swatch grid, premium items marked locked
- **Global Typography & Accent** — base font family, plus one accent color replacing the default black ink
- **Digital Perks** — attach an audio snippet

### 4. Element Settings Sheet
Appears when a specific text block (Name, Job Title) is tapped:
- Font weight & style: Regular / Bold / Italic / All-Caps
- Alignment controls
- A **kerning slider** for letter-spacing — the hero control of this sheet
- A visibility toggle to hide the field entirely

### 5. Editing the Back — Add Link
The card flipped within the editor. An elegant `+` opens an Add Link input (Platform Name + URL); the QR generates automatically and aligns itself. Show the link list with drag-to-reorder handles and per-link active/inactive toggles.

**Also provide a light-mode variant of screen 1** (`#FFFFFF` background, `#000000` text, `#F0F0F3` sheets).
