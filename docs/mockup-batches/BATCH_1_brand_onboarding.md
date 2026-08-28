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

# BATCH 1 of 5 — Brand & Onboarding

Design these **5 screens**, in this order. Dark mode.

### 1. Brand sheet
The `Lynx.` wordmark in three lockups on one artboard: white-on-pure-black (primary), black-on-Bone `#FBFAF5` (secondary), and the app icon tile — serif `L` (or full `Lynx.` if legible small), white on pure black, edge-to-edge, no rounded inner container, no gradient.

### 2. Auth / Splash
Completely black. `Lynx.` centered in perfectly kerned white serif. Two buttons at the very bottom only: **Continue with Apple**, **Continue with Google**. No email/password, no sign-up link, no legal wall, no illustration. Near-zero friction.

### 3. Onboarding — Core Identity
Three massive, elegant text inputs with generous vertical rhythm and **no visible input boxes** — just a hairline rule and a small-caps label above each:
1. Full Name  2. Job Title (or Major)  3. Company (or University)
A single sleek **Mint Card** button at the bottom. Nothing else is requested — no phone, no email, no headshot, no links.

### 4. Onboarding — The Reveal ("Magic Moment")
Screen fully dark. The 3D card has fallen out of shadow into center with weight (heavy haptic). Default **Bone** texture, name and title **embossed** in perfect typography. A subtle glowing tooltip at the card's edge reads *"Swipe to flip."*

### 5. Onboarding — Empty Card Back
Post-flip state: a blank **Master QR** placeholder centered, an empty App Grid below it, and a single glowing `+` with the label *"Add your first link."* A small, subtle cog icon sits in a bottom corner.
