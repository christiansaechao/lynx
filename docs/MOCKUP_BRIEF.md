# Lynx — Mobile Mockup Brief

*A design handoff prompt. Paste this whole document into a mockup/design tool. It describes every mobile screen, the branding, the palette, and the motion language.*

---

## 1. The Product in One Paragraph

Lynx is an electronic business card app for iOS and Android. In high-pressure networking environments — job fairs, meetups, recruiting events — people need a memorable way to hand over their contact info. Lynx turns that exchange into a status symbol: a beautifully typeset, physically-textured digital card that the owner shows off, flips over, and shares by QR code or NFC tap. Collected cards land in a "Rolodex" that preserves each card's original design, so you remember the person by the card they made.

**We are not selling a contact app. We are selling a digital status symbol.** Every design decision should serve that.

## 2. The Aesthetic: "American Psycho"

The design language is drawn directly from the business card scene in *American Psycho*. It should feel premium, obsessively clean, and focused almost entirely on typography and subtle texture.

- **Restraint above all.** Whitespace is the primary design element. If a screen looks empty, it is probably correct.
- **Typography is the interface.** Perfect kerning, exact alignment, generous letter-spacing on small caps labels. The card should look like it was set by a typographer, not laid out in a form builder.
- **Tangibility.** Surfaces carry subtle paper grain, linen crosshatch, embossing, and light glare. The card should read as an object being held, not a rectangle on a screen.
- **No chrome.** Avoid drop-shadowed buttons, rounded "app-y" cards, gradients-as-decoration, colorful icon sets, and filled primary buttons wherever a text button will do.

**Deliberate anti-patterns — do not include:** bottom tab bars on the card screen, hamburger menus, illustration-heavy empty states, mascots, emoji, bright accent colors used as decoration, drop shadows on flat UI elements, or any "friendly SaaS" visual voice.

## 3. Logo & Branding

**Wordmark:** the single word `Lynx.` — lowercase-sensitive, always with the **trailing period**. The period is a core part of the mark; it signals finality and precision, and it should never be dropped.

- Set in an elegant, high-contrast **serif** (Garamond, Didot, Canela, or similar). Not a script, not a geometric sans.
- **Kerning is the whole logo.** Letter-spacing should be slightly loose and optically balanced — the mark should look agonized over.
- **Primary lockup:** white `Lynx.` centered on pure black. **Secondary:** black on Bone (`#fbfaf5`).
- No icon, no symbol, no lettermark accompanying the wordmark. The word alone is the brand.
- **App icon:** the letter `L` (or the full `Lynx.` if it remains legible at small size) in serif, white on pure black, edge-to-edge with no rounded inner container and no gradient.
- **Tone of voice:** terse, confident, understated. Button labels are short and declarative — "Mint Card", "Add your first link", "Order as a Physical Card". Never exclamatory, never cute.

Please produce the wordmark in: black-on-bone, white-on-black, and the app icon tile.

## 4. Color & Theming

The app UI is a strict monochrome system. **All color in the product comes from the card materials, never from the interface.**

### App UI palette (these are the live values in code)

| Token | Light | Dark |
|---|---|---|
| `background` | `#FFFFFF` | `#000000` |
| `text` | `#000000` | `#FFFFFF` |
| `textSecondary` | `#60646C` | `#B0B4BA` |
| `backgroundElement` (sheets, inputs, chips) | `#F0F0F3` | `#212225` |
| `backgroundSelected` (active chip/row) | `#E0E1E6` | `#2E3135` |

Dark mode is the hero and the default presentation for all mockups — the card reads as an illuminated object against pure black. Deliver light-mode variants for the Editor, Rolodex, and Settings screens.

### Card palette — "Bone" default material (live values)

- Background: a soft diagonal gradient from `#FBFAF5` → `#E9E3D6` (top-left to bottom-right).
- Primary ink (name): `#1C1A14`
- Secondary ink (labels, title, contact line): `#4A463C`
- Name letter-spacing `0.5`; label letter-spacing `2.5` and set in **small caps / all-caps**.

### Spacing scale

`2 / 4 / 8 / 16 / 24 / 32 / 64` pt. Use it strictly — no arbitrary values.

### Card geometry

Standard business-card aspect ratio (**1.75:1**, landscape). Corner radius should be tight and physical — roughly 12–16pt, the radius of a real die-cut card, never a pill.

## 5. The Materials Catalog

Materials are the product's cosmetic economy and the core of the "flex". Each is a real reactive surface: gyroscope tilt drives a glare/highlight layer in real time, so texture shifts as the phone moves. **Please mock each material as a card face, showing the tilt/glare state.**

**The Classics (free tier)**
1. **Bone** *(default)* — warm off-white matte, microscopic porous paper grain, text slightly **raised/embossed** with a soft drop shadow catching the light.
2. **Silian Rail** — crisp, brilliant, stark white with a subtle high-end linen crosshatch.

**The Modern Executives**
3. **Obsidian Matte** — completely light-absorbing black, infinitely deep. Text is **debossed** (pressed inward) in a gloss black that only reveals itself on tilt.
4. **Brushed Gunmetal** — dark moody metallic grey, microscopic horizontal brush strokes that sharply catch the glare on rotation.
5. **Anodized Titanium** — cool matte metallic, dense and completely smooth.

**The Creatives & Techies**
6. **Frosted Glass** — translucent icy glassmorphism; blurs whatever sits behind the card.
7. **Holographic Prism** — glossy retro-futuristic; iridescent shifting rainbow gradients (purple/blue/pink) like a rare trading card.
8. **Carbon Fiber Weave** — microscopic woven grid under glossy digital resin, shimmering under 3D light.

**The Avant-Garde**
9. **Raw Concrete** — brutalist, light grey, heavily textured and porous; text looks spray-stenciled.
10. **Rose Gold Foil** — highly reflective warm luxurious metallic.

## 6. Motion Language

- **The Flip** — the signature interaction. A smooth, realistic 3D rotation from card front to card back, with a soft light-glare sweeping across the material mid-rotation. Triggered by a thumb swipe across the card.
- **The Thud** — on card creation, the card falls out of darkness into center screen and lands with weight, paired with a heavy haptic.
- **Tilt response** — the material's glare layer tracks device gyroscope continuously and subtly, at rest.
- **Sheet motion** — bottom sheets glide, never pop.
- Micro-interactions everywhere should feel tactile and damped, never bouncy or springy.

---

# 7. The Screens

## Navigation Model — "The Hidden App"

This is the most important structural idea in the product, and the mockups must communicate it.

**There is no bottom tab bar on the card screen.** When the app opens, the *entire screen* is dedicated to the card. It should feel like holding a physical object, not operating software.

The rest of the application — Rolodex, events, analytics, settings — is behind a **secret door**: the user flips to the *back* of their card, where a single minimalist cog icon sits in a subtle bottom corner. Tapping it shrinks the card away and transitions into a conventional app layout (header, scrollable lists, tabs). This preserves the purity of the aesthetic while networking, and hides the CRM software until the user is alone and actually wants it.

Please mock the transition itself as a sequence: card back → cog tap → card shrinking → app shell.

---

### 7.1 Auth / Splash
Completely black screen. `Lynx.` centered in perfectly kerned white serif. Two buttons at the very bottom only: **Continue with Apple**, **Continue with Google**. No email/password, no sign-up link, no legal wall, no illustration. Near-zero friction.

### 7.2 Onboarding — Core Identity
Smooth transition from auth. Three massive, elegant text inputs, stacked with generous vertical rhythm and no visible input boxes — just a hairline rule and a small-caps label:
1. **Full Name**
2. **Job Title** (or Major, if student)
3. **Company** (or University)

A single sleek **Mint Card** button at the bottom. Nothing else is requested — no phone, no email, no headshot, no links.

### 7.3 Onboarding — The Reveal ("Magic Moment")
Screen goes fully dark. The 3D card falls out of shadow into center with a heavy haptic thud. Default **Bone** texture, name and title embossed in perfect typography. Mock 2–3 frames of this fall.

Then: a subtle glowing tooltip at the card's edge — *"Swipe to flip."* On swipe, the card rotates in 3D with light-glare passing over the texture, revealing a blank Master QR and an empty App Grid with a glowing `+`: *"Add your first link."*

### 7.4 Home — Card Front (the app's default screen)
Full-bleed black. The card floats center, filling most of the screen, tilting gently with the gyroscope. No tab bar, no header, no visible navigation whatsoever.

The card front supports **two content contexts using the identical layout** — please mock both:

**Employed / Business Profile**
- `companyName` prominent at top (e.g. "Pierce & Pierce")
- `fullName` dead center (e.g. "Patrick Bateman")
- `jobTitle` below the name (e.g. "Vice President")
- `department` below title (e.g. "Mergers and Acquisitions")
- `location`, `phone`, `email` in bottom corners, small caps, tightly set

**Job Seeker / Student Profile**
- `headline` replaces company at top (e.g. "Software Engineering")
- `fullName` dead center
- `targetRole` replaces job title (e.g. "Full-Stack Developer")
- `education` replaces department (e.g. "B.S. Computer Science, Univ. of Washington")
- `location`, `phone`, `email` in bottom corners

### 7.5 Home — Card Back (Sharing Hub)
The reverse face, reached by the flip. Contains:
- **The Master QR Code** — central and prominent. Scanning it gives the recipient a downloadable high-quality image of both faces of the card, so they keep a visual memory of it.
- **The App Grid** — a minimalist grid of *monochrome* icons below/around the QR, one per link (LinkedIn, GitHub, Portfolio, Live Demo). Strictly monochrome — no brand colors.
- **Contextual Expansion** — tapping any grid icon smoothly expands it into a **full-screen QR** for that specific URL, so a recruiter can scan straight to a portfolio piece. Mock the expanded state.
- **The cog icon** — small, subtle, bottom corner. The secret door.
- Optionally, an **audio snippet** play button (an elevator pitch or name pronunciation).

### 7.6 Share Sheet / NFC Tap-to-Share
A minimal overlay for the moment of exchange. If both people have Lynx, phones tap together (NameDrop-style) and cards exchange instantly. Mock: the "hold near another phone" waiting state, and the successful-exchange confirmation.

### 7.7 The Card Editor (WYSIWYG)
The card sits center screen looking *exactly* as it will when shared. Editing is direct manipulation:
- Tapping a text element (name, title) makes it editable **in place** on the card.
- **Invisible UI** — when not actively editing, there are no borders, outlines, handles, or input boxes anywhere.
- A single minimalist floating gear/palette button in a bottom corner opens global settings.

**Global Settings sheet** (bottom sheet):
- **Layout Templates** — structural blueprints: "The Classic" (centered), "The Creative" (asymmetrical), "The Dev" (terminal/monospace). Also referenced as one-tap presets: **"The Bateman"** (centered classic), **"The Techie"** (monospace terminal).
- **Backgrounds & Textures** — the curated paper textures, plus mesh gradients, glassmorphism, and custom photo upload.
- **Card Materials & Finishes** — the catalog above, as a swatch grid with locked/premium items marked.
- **Global Typography & Accent** — base font family, plus one accent color to replace the default black ink.
- **Digital Perks** — attach an audio snippet.

**Element Settings sheet** (appears when a specific text block is tapped):
- Font weight & style: Regular / Bold / Italic / All-Caps
- Alignment, and a **kerning slider** for letter-spacing
- Visibility toggle to hide a field entirely

**Editing the Back:** a flip gesture/button turns the card in the editor. An elegant `+` adds a link (Platform Name + URL); the QR generates automatically and aligns itself. Links can be dragged to reorder, and toggled inactive without deleting.

### 7.8 The Rolodex (Collected Contacts)
The conventional app layout, reached through the secret door. A searchable collection of cards received from others, **each preserved in its original high-fidelity design** — someone's Carbon Fiber card still looks like Carbon Fiber here. This is the whole point: visual recall beats a list of names.

Mock both a card-grid view and a compact list view, plus the search state and an empty state.

**Folders:** users create event folders ("Tech Fair 2026") and mark one **Active**. While active, every card scanned or tapped is silently auto-routed into it, so the user never sorts during a conversation. Mock the folder list with a clear **Active** indicator, and the create/activate flow.

**Contact detail:** the full received card, front and back, plus private notes and an **Intro** button that auto-drafts a contextual follow-up: *"Hi [Name], it was great meeting you at [Event]…"*

### 7.9 Post-Meetup Sorting (Tinder-style)
Entered from a push notification: *"View the 45 Lynx connections you made today."*

A stack of the large, beautiful 3D cards collected that day, one at a time, in their original materials.
- **Swipe left** — file to the general event folder. Saved, not prioritized.
- **Swipe right** — Star & prioritize. Card gets a "Starred" badge. These are the VIP recruiters and hot leads.
- **Swipe up** — pauses the stack and opens a quick note prompt: *"Met at the Google booth, loves React Native."*

Mock the resting stack, a mid-swipe state with the directional affordance, the note prompt, and the completion/summary screen.

### 7.10 Personal CRM / Analytics
Lightweight, typographic, chart-minimal — this is not a dashboard, it's a quiet report.
- **Portfolio analytics:** which links actually convert. *"GitHub — 4 clicks today. Portfolio — 1."*
- **Scan counts:** *"Your card was scanned 12 times this week."* Gamified, dopamine-oriented.
- **Follow-Up Nudges:** swipe a collected card to set a reminder (*"email this person in 48 hours"*), delivered by push notification. Mock the nudge-setting UI and the nudge list.

### 7.11 Settings
Standard grouped list, monochrome, no icons or minimal hairline icons. Includes account, notifications, NFC preferences, sync status (offline-first — the app works fully in dead zones and syncs in the background, so show a subtle sync indicator), and card management.

### 7.12 Store / Premium Materials
The cosmetic economy. A grid of material swatches, each rendered as a live tilting card face, with locked items marked and one-off prices (~$1.99). Also the **"Order as a Physical Metal Card"** upsell — the user's own design printed on heavy metal or carbon fiber with an embedded NFC chip (~$50–100). Present it as a luxury product page, not a checkout form.

### 7.13 Gamified Unlocks
Milestone rewards for collecting cards (10 / 50 / 100 Lynx) unlocking premium materials or a "Mystery Box". Mock the milestone-progress view and the unlock-reveal moment. Push copy example: *"You only need 2 more connections to unlock the Holographic Prism texture."*

### 7.14 Public Web View (Viral Loop) — *not a mobile app screen, but mobile-web*
When a non-user scans a Lynx QR with their stock camera, they land on a beautiful mobile web page showing the card, front and back, in its real material. One prominent, unmissable button: **"Save to Contacts & Create Your Own Lynx Card."** This is the app's primary acquisition surface — please treat it as a designed screen, not an afterthought.

---

## 8. Deliverables Requested

1. The `Lynx.` wordmark in all three lockups, plus the app icon tile.
2. Every screen in section 7, in **dark mode**; light-mode variants for Editor, Rolodex, and Settings.
3. All 10 materials rendered as card faces showing the tilt/glare state.
4. Both card content contexts (Employed and Job Seeker) on the same layout.
5. Motion sequences for: the Flip, the Reveal thud, the secret-door transition, and a Post-Meetup swipe.
6. A type scale and spacing specimen sheet derived from the tokens in sections 4 and 5.
