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

# BATCH 5 of 5 — Store, Settings & Public Web View

Design these **5 screens**.

### 1. Settings
Standard grouped list, monochrome, hairline icons or none at all. Account, notifications, NFC preferences, card management, and a subtle **sync status** indicator — the app is offline-first, working fully in dead zones (basement convention centers) and syncing in the background.
**Also provide a light-mode variant of this screen.**

### 2. Store — Premium Materials
The cosmetic economy. A grid of material swatches, each rendered as a **live tilting card face** rather than a flat thumbnail, with locked items marked and one-off prices (~$1.99). Restrained — this should feel like a curated catalog, not an app store.

### 3. Physical Card Upsell
"Order as a Physical Metal Card" — the user's own design printed on heavy metal or carbon fiber with an embedded NFC chip, ~$50–100. Present it as a **luxury product page**, not a checkout form: large product imagery, minimal copy, one confident CTA.

### 4. Gamified Unlocks
Milestone rewards for collecting cards (10 / 50 / 100 Lynx) unlocking premium materials or a "Mystery Box". Show the milestone-progress view and the unlock-reveal moment. Push copy example: *"You only need 2 more connections to unlock the Holographic Prism texture."*

### 5. Public Web View (mobile web, not an app screen)
When a **non-user** scans a Lynx QR with their stock phone camera, they land here. A beautiful mobile web page showing the card, front and back, in its real material. One prominent, unmissable button: **"Save to Contacts & Create Your Own Lynx Card."** This is the app's primary acquisition surface — treat it as a fully designed screen, not an afterthought.
