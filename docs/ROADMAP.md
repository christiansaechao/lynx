# Future Roadmap & Backlog

This document outlines features and integrations planned for later iterations of Lynx, beyond the initial MVP.

## Integrations
### Bulk LinkedIn Connect
- **The Concept:** LinkedIn remains the dominant professional networking platform. While Lynx replaces the friction of the initial contact exchange, users ultimately want those connections secured on LinkedIn.
- **The Feature:** Within the "Rolodex" screen, a user can view an Active Folder (e.g., "Tech Fair 2026") and tap a "Connect All via LinkedIn" button.
- **Execution:** The app will iterate through the collected cards in that folder, find their attached LinkedIn URLs, and facilitate sending bulk connection requests. This saves the recruiter from having to manually type 50 names into the LinkedIn search bar the morning after an event.

## Cloud & Persistence
- **Cloud Sync:** Transitioning from strictly local on-device storage to an optional cloud backend (e.g., Supabase, Firebase) so users can log in on a new device and instantly recover their customized card and entire Rolodex.

## Kiosk / Booth Mode (For Tablets)
- **The Concept:** Trade show booths currently use paper flyers or clunky email sign-up sheets.
- **The Feature:** A dedicated "Kiosk Mode" optimized for iPads and Android tablets. A company can lock the tablet in this mode, displaying a massive, beautiful, animated version of the company's Master Card.
- **The Interaction:** Attendees walking by the booth can simply scan the giant Master QR code on the tablet to instantly download the company's contact info, product links, and brochures directly to their phone. This acts as a passive lead-generation tool even when the booth reps are busy talking to other people.

## The B2B Web Application
- **Enterprise Admin Dashboard:** To support the B2B monetization strategy, a companion web application (likely built with Next.js or React) will be developed.
- **The Purpose:** Marketing and HR teams cannot manage 500 employee seats from a mobile phone. The web dashboard allows them to:
  - Design the "Master Template" for the company using a desktop-class editor.
  - Provision and revoke employee access (manage seats).
  - View high-level analytics (e.g., "Our sales team generated 1,200 card scans at the convention this weekend").
  - Push global updates (like a new company logo) instantly to all employee mobile apps.

## The Reverse Job Board (AI Talent Sourcing)
- **The Concept:** Traditional job boards (like LinkedIn) rely heavily on companies posting jobs and hoping the right candidate applies. Lynx flips this dynamic.
- **The Feature:** Because individuals are already building beautiful digital cards loaded with their resumes, GitHubs, and portfolios, Lynx essentially becomes a massive talent database.
- **The Interaction:** A recruiter logs into the Web Dashboard and searches: *"Find me a Web Developer in Seattle with React Native experience."* The system queries the global database of public "Job Seeker" profiles and surfaces the best matches.
- **The Value:** This acts as a massive "flywheel" for the platform. Individuals *have* to be on Lynx and keep their cards updated because Enterprise recruiters are actively using it as an AI-powered headhunting tool.

## Universal Apply (QR-to-Application Autofill)
- **The Concept:** Job applications are the last mile of friction in hiring — even a candidate with a polished Lynx profile has to re-type the same work history and contact info into every employer's ATS (Applicant Tracking System) by hand. Universal Apply turns that around: any employer, from a Fortune 500 to a single retail location, can let candidates apply by scanning a QR code that pre-fills their application from Lynx.
- **The Feature:** An employer places a Lynx "Apply" QR code wherever they'd normally post a job — a "Now Hiring" window sign, a job posting page, an in-store kiosk, a flyer at a career fair. A candidate scans it with their phone camera (no app install required to start), authorizes Lynx to share their Job Seeker profile, and lands on the employer's application with name, contact info, work history, education, and portfolio/resume links already filled in. Anything the employer's form asks for that isn't in the Lynx profile, the candidate fills in manually, same as today.
- **The Interaction:**
  1. Employer generates an Apply QR code for a specific role (or a general "Careers" code) from the B2B Web Dashboard.
  2. Candidate scans the code. If they have a Lynx account, they get an instant permission prompt ("Share your profile with [Employer]?"); if not, they're offered a fast web-based signup using the same 3-step onboarding flow as the mobile app.
  3. Lynx maps the candidate's profile fields onto the employer's application — either by rendering Lynx's own lightweight application form (for smaller employers with no ATS) or by pushing structured data into the employer's existing ATS via API/webhook (for larger employers who already use Workday, iCIMS, Greenhouse, etc.).
  4. Candidate reviews the pre-filled application, completes any employer-specific questions (availability, work authorization, etc.), and submits — typically in under a minute.
- **The Value:** This is a second, distinct flywheel from the Reverse Job Board above, and it targets a different buyer. Where the Reverse Job Board sells to recruiters searching *for* candidates (typically white-collar, relationship-driven hiring), Universal Apply sells to high-volume, high-turnover employers (retail, food service, warehouse, hospitality) who are bottlenecked on application *volume and drop-off*, not candidate discovery. It gives Lynx a second monetization path — a low-friction, usage-based or per-posting fee to employers, sold independently of the B2B seat/dashboard product — and it drives mobile app adoption from a completely different direction: people who've never networked with Lynx at an event might still create a profile purely to apply for a job faster.
- **What needs to be true first:**
  - **ATS integration is the real engineering lift, not the QR code or autofill UI.** Each major ATS vendor (Workday, iCIMS, Greenhouse, and QSR/retail-specific systems) has its own integration surface; initial rollout should likely target employers without an ATS (Lynx hosts the application form directly) before investing in deep ATS partnerships.
  - **Consent and data trust.** Sharing a full profile with an unfamiliar employer is a different trust bar than a recruiter browsing the Reverse Job Board's opt-in talent pool — candidates need a clear, per-employer consent step, and to see exactly what's being shared before it's sent.
  - **Field mapping in the Data Model.** The Job Seeker Profile's structured fields (work history, education, portfolio links) need to map cleanly and predictably onto common ATS application schemas; this should inform how those fields are structured well before this phase is built, not after.
  - **Depends on Phase 1 reaching critical mass.** Like the Reverse Job Board, Universal Apply is only valuable to an employer if enough candidates already maintain a current Lynx profile — it is a monetization layer on top of adoption, not a standalone acquisition strategy.

## Material Trials ("Try Before You Buy" via IRL Encounter)
- **The Concept:** The Rolodex and Viral Loop docs already establish that meeting someone with a striking material (Holographic Prism, Obsidian) is a core comparison/FOMO moment — *"you just have the default Bone? I unlocked the Carbon Fiber weave."* Material Trials turns that moment of envy into an immediate, frictionless purchase funnel instead of leaving it as passive admiration.
- **The Feature:** The first time a user scans or NFC-taps a card wearing a premium material they don't own, they unlock a one-time, time-boxed **Trial** of that material — applied to their *own* card, with their own name/company/data, not the other person's. The trial does not touch or overwrite the user's actual displayed/shared card; it's a preview state they can switch into and back out of from the Editor's Card Materials & Finishes control.
- **The Interaction:**
  1. User A has the Holographic Prism material. User B, who does not own it, scans/taps User A's card.
  2. User B gets a prompt: *"You've unlocked a trial of Holographic Prism — try it on your card for 48 hours."*
  3. User B can preview and switch to Holographic Prism in the Editor at will during the trial window, rendered with their own card data.
  4. As the trial nears expiry, a push notification nudges conversion (consistent with the existing gamified personal-analytics notification pattern): *"Your Holographic Prism trial ends tonight — keep it for $1.99?"*
  5. On expiry, the user's card silently reverts to their owned/default material. No data loss, no broken state — just loss of access to the trialed material.
- **The Rule — One-Off, Ever:** A user gets exactly one trial per premium material *type*, regardless of how many different cards or people they scan wearing it. This is a `trialedMaterials` set keyed by material ID, not by the scanned card or person — scanning five different people who all have Obsidian only grants one Obsidian trial, the first time. This prevents trial-farming and keeps the mechanic feeling like a genuine one-shot moment rather than a renewable freebie.
- **Free Materials Are Never Gated:** Default/free materials (Bone, Silian Rail) are available to every user from the start and are not part of the trial system at all — trials exist only to convert users on the *paid* cosmetic tier described in the [Monetization Strategy](./MONETIZATION_STRATEGY.md).
- **The Value:** This is a lead-gen mechanic layered directly on top of the existing premium materials microtransaction revenue stream, not a separate system. Where the milestone-based reward system (see [The Viral Loop & IRL Flex](./VIRAL_LOOP_STRATEGY.md)) grants materials for free after enough grinding, Material Trials creates urgency around a *specific* IRL-triggered moment and converts it into a purchase decision while the emotional context (the encounter, the envy) is still fresh.
- **What needs to be true first:**
  - **The premium materials system and per-user materials inventory need to exist first** — this feature is a state layer (`trialedMaterials`, `trialExpiresAt`) on top of that inventory, not a replacement for it.
  - **The Editor's material-switching UI needs to support a distinct "trial" state** (e.g. a countdown badge on the trialed material's swatch) so users understand it's temporary before they commit emotionally to a card they're about to lose.
  - **Depends on the premium cosmetic tier reaching real adoption first** — trials are only a meaningful funnel once there are enough distinct premium materials in circulation for the "I saw someone with X" moment to happen organically at events.

## Event Discovery & Auto-Folders
- **The Concept:** Currently, users have to manually create an "Active Folder" when they arrive at an event. We want to make the app a proactive tool for finding networking opportunities.
- **The Feature:** An "Events Near Me" tab in the mobile app that aggregates local tech fairs, conventions, and industry meetups. 
- **The Interaction:** A user browses the list and taps "I'm Attending" on *Tech Fair 2026*. The app automatically provisions the Rolodex folder for them and sets a calendar reminder. On the day of the event, the app uses geofencing to automatically set that folder as "Active" the moment they walk into the convention center.

## Phase 2: Web Dashboard Deferred Integrations
To keep the initial web MVP lightweight and hyper-focused, several advanced SaaS libraries have been explicitly deferred to Phase 2 (Month 2+):
- **`stripe` & `@stripe/stripe-js`:** For processing B2B seat subscriptions and Pro Individual upgrades.
- **`recharts` & `date-fns`:** For rendering complex, interactive data visualization charts on the analytics dashboard.
- **`@tanstack/react-table`:** A headless data grid for sorting and paginating thousands of contacts for Enterprise HR managers.
- **`papaparse`:** For enabling `.CSV` data exports of Rolodex contacts (crucial for Salesforce/HubSpot integrations).
- **`@hello-pangea/dnd`:** For building the complex drag-and-drop Enterprise Master Template designer.
- **`framer-motion` & `sonner`:** For polished page transitions and popup toast notifications.
