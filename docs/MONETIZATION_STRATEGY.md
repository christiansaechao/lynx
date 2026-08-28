# Monetization Strategy

## Core Philosophy: Frictionless Growth
The foundational rule for Lynx is that **the core networking experience must be completely free**. Paywalling the ability to create, share, or collect a business card breaks the network effect. The goal is massive, viral adoption driven by the utility and aesthetic of the app. 

Monetization should focus exclusively on B2B features, physical goods, and premium "status" cosmetics, ensuring the app remains fully accessible to students and job seekers.

## 1. B2B / Enterprise Teams (SaaS Model)
While individuals use the app for free, companies can pay a monthly subscription per seat for "Lynx for Teams".
- **Centralized Admin Dashboard:** Marketing or HR departments can design a single "Master Template" for the company.
- **Instant Deployment:** The template is pushed to all employees' phones instantly.
- **Live Updates:** If the company rebrands or changes a primary link, the admin updates it once, and all employee cards are updated dynamically.
- **Analytics:** Companies can see aggregate data on how often their sales reps' cards are being scanned at events.

## 2. Physical "Black Card" Upsells (Hardware)
Capitalize on the time users spend designing their perfect digital card by offering a premium physical counterpart.
- **The Offering:** A button inside the app to "Order as a Physical Metal Card."
- **Execution:** Partner with a manufacturer to print the user's custom design onto a sleek, heavy metal or carbon fiber card equipped with an NFC chip. 
- **Revenue:** The app remains free, but users pay a premium (e.g., $50-$100) for the luxury physical item.

## 3. CRM & Data Integrations (Power User Subscriptions)
The Rolodex and Active Folders are free for basic collection, but power users (recruiters, salespeople) require data mobility.
- **The Offering:** Premium integrations to export collected contacts.
- **Execution:** With a paid tier, recruiters can export an entire Active Folder (e.g., "Tech Fair 2026") directly into Salesforce, HubSpot, or Greenhouse with a single click, completely automating their post-event data entry.

## 4. Creator Marketplace & Premium Materials (Cosmetics)
Monetize status and extreme personalization using a model similar to video game cosmetics.
- **Premium Materials:** Users can make one-off microtransactions (e.g., $1.99) to unlock exclusive 3D finishes, like holographic foil that shimmers based on device tilt, or animated glassmorphism backgrounds.
- **Creator Marketplace:** Eventually, allow professional graphic designers to create and sell their own layout templates or 3D materials on a marketplace within the app, with Lynx taking a standard 30% platform cut.

## 5. Payment Infrastructure Stack
To execute this monetization strategy cleanly without running into App Store rejections or fragmented codebases, the technical stack will be strictly split based on the product type:

- **RevenueCat (For Mobile Digital Goods - Subject to 30% App Store Tax):** 
  Apple and Google strictly mandate that any digital goods consumed inside an app must use their native In-App Purchases (IAP). We will use **RevenueCat** to manage these cross-platform transactions.
  **Products in this bucket:**
  - Premium Layout Templates (e.g., $2.99 one-off purchase).
  - Cosmetic 3D Materials (e.g., Holographic foil, animated backgrounds).

- **Stripe (For Physical Goods & Web SaaS - Subject to ~2.9% + 30¢ Fee):** 
  Stripe will be used whenever we are legally allowed to bypass the App Store tax to protect margins.
  **Products in this bucket:**
  - **Physical NFC Cards:** Apple allows third-party processors for *physical* goods inside a mobile app. We will use the **Stripe React Native SDK** for users ordering a physical metal card.
  - **"Pro Individual" Web Subscription ($4.99/mo):** Handled via Stripe Billing. Power users log into the companion web dashboard to access their "Personal CRM" (drafting follow-up emails, detailed portfolio analytics). By moving this to the web, we completely bypass Apple's 30% cut on these recurring subscriptions.
  - **Enterprise Subscriptions (B2B):** Handled via **Stripe Billing** on the Next.js web dashboard (e.g., $10/seat/month for companies). Because it is purchased on the web, Apple's rules do not apply.
  - **Premium CRM Integrations:** Add-ons purchased by recruitment agencies on the web dashboard to sync collected leads to Salesforce or HubSpot.
  
  **The Margin Breakdown:** Bypassing Apple's 30% tax for physical goods is critical for hardware margins. For example, on a $50 physical card sale:
    - **Apple IAP (30%):** Takes $15.00 (You keep $35.00 to cover manufacturing).
    - **Stripe (~2.9% + 30¢):** Takes $1.75 (You keep $48.25 to cover manufacturing).
    - *Result:* This architecture choice preserves an additional $13.25 in profit margin per physical card sold.
