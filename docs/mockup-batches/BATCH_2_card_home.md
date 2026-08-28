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

# BATCH 2 of 5 — The Card (Home)

Design these **5 screens**. Dark mode, full-bleed black. The card floats center, filling most of the screen, tilting gently with the gyroscope.

**CRITICAL — "The Hidden App":** there is **no bottom tab bar, no header, and no visible navigation** on these screens. The entire screen is the card. It must feel like holding a physical object, not operating software. The rest of the app is hidden behind a cog icon on the card's back.

### 1. Home — Card Front, Employed / Business Profile
Card front, Bone material. Layout:
- `companyName` prominent at top — "Pierce & Pierce"
- `fullName` dead center — "Patrick Bateman"
- `jobTitle` below the name — "Vice President"
- `department` below title — "Mergers and Acquisitions"
- `location` / `phone` / `email` in the bottom corners, small caps, tightly set

### 2. Home — Card Front, Job Seeker / Student Profile
**The identical layout**, different content:
- `headline` at top — "Software Engineering"
- `fullName` dead center
- `targetRole` — "Full-Stack Developer"
- `education` — "B.S. Computer Science, Univ. of Washington"
- `location` / `phone` / `email` in the bottom corners

### 3. Home — Card Back (Sharing Hub)
- **Master QR Code** — central and prominent. Scanning it hands the recipient a downloadable image of both card faces.
- **App Grid** — minimalist grid of **strictly monochrome** icons, one per link (LinkedIn, GitHub, Portfolio, Live Demo). No brand colors.
- Optional small **audio snippet** play button (elevator pitch / name pronunciation).
- A small, subtle **cog icon** in a bottom corner — the secret door into the rest of the app.

### 4. Contextual QR Expansion
A single App Grid icon has been tapped and has smoothly expanded into a **full-screen QR** for that one specific URL, so a recruiter can scan straight to a portfolio piece. Show the platform name and destination clearly.

### 5. NFC Tap-to-Share
Minimal overlay for the moment of exchange — when both people have Lynx, phones tap together (NameDrop-style). Show two states on one artboard: the "hold near another phone" waiting state, and the successful-exchange confirmation.
