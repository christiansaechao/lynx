# Product Requirements

## Overview
Lynx is a mobile application that acts as an electronic business card. In high-pressure networking environments (job fairs, meetups, recruiting events), users need a memorable way to share their contact information.

## Core Features
1. **Customizable Business Card (Front) & Templates**
   - "American Psycho" aesthetic: clean, minimalistic, premium feel.
   - Users can customize text, fonts, colors, and layout of their card to stand out.
   - **Templates & Presets System:** To ensure easy onboarding, users can select from 1-click curated presets (e.g., "The Bateman" for a centered classic look, "The Techie" for a monospace terminal look). These presets instantly apply a cohesive combination of typography, layout, and paper textures without requiring manual configuration.
   
2. **The Back of the Card & Sharing Hub**
   - The card can be elegantly "flipped" to reveal the backside, which serves as the primary sharing interface.
   - **The Master QR Code:** A central, prominent QR code. When scanned by a recruiter, it provides them with a high-quality, downloadable image (screenshot) of both the front and back of the business card to save directly to their phone's photo gallery, ensuring they have a visual memory of the card.
   - **The App Grid (Specific Links):** Surrounding or below the Master QR code is a minimalist grid of monochrome icons representing specific links (e.g., LinkedIn, GitHub, a "Live Demo" link). 
   - **Contextual Expansion:** If the user wants to showcase a specific portfolio piece or live demo instantly without making the recruiter navigate an image, they tap the respective icon in the grid. It smoothly expands into a full-screen QR code for the recruiter to scan, taking them directly to that specific URL.
   
4. **App-to-App NFC Exchange (Tap to Share)**
   - If both the sender and the receiver have the Lynx application installed, they can simply tap their phones together using NFC (similar to Apple's NameDrop) to instantly exchange their full digital business cards.

5. **The "Rolodex" (Collected Contacts) & Active Folders** — see [Rolodex Experience](./ROLODEX_EXPERIENCE.md#implementation-status) for build status
   - The app features a dedicated Contacts/Rolodex screen to manage saved cards.
   - When a user collects another person's card (via QR scan or NFC tap), it is saved here in its original, high-fidelity format.
   - **Active Folders:** Users (like recruiters) can create specific event folders (e.g., "Tech Fair 2026") and mark them as *Active*. Any business cards collected during that time are automatically routed into that folder, removing the need to manually sort them later.
   - Users can also add private notes to individual cards and search through their entire collection, allowing them to focus entirely on the conversation rather than data entry.

6. **The Personal CRM (For Single Users/Students)**
   While enterprises get heavy dashboard analytics, single users get a lightweight "Personal CRM" to help them actually land jobs and maintain connections:
   - **Follow-Up Nudges:** When a student collects a recruiter's card, they can swipe on it to set a "Nudge" (e.g., "Remind me to email this person in 48 hours via Push Notification").
   - **One-Tap Intros:** When looking at a collected card, the user can tap an "Intro" button that auto-drafts an email or message based on the context: *"Hi [Name], it was great meeting you at [Active Folder Event Name]..."*
   - **Portfolio Analytics:** Students can see which of their links are actually converting (e.g., "My GitHub link got 4 clicks today, but my Portfolio only got 1"), allowing them to A/B test their personal branding.

7. **Personal Analytics (The LinkedIn Hook)**
   - To drive daily retention, the mobile app provides basic, gamified notifications for the individual user.
   - Users receive metrics like "Your card was scanned 12 times this week," giving them a dopamine hit and proving the app's value even when they aren't actively networking.

8. **Settings & Cloud Sync**
   - Users can configure their application settings.
   - The app utilizes an offline-first architecture. Card data and Rolodex contacts are heavily cached locally so the app functions instantly in dead zones, syncing to the cloud (Supabase) in the background when a connection is available.
