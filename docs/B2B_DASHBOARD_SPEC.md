# B2B Enterprise Dashboard Specification

## Overview
The Enterprise Dashboard is a companion web application (desktop-first) designed for HR, Marketing, and Sales Directors, as well as **"Pro Individual"** power users. It allows companies to manage their employees' Lynx cards at scale, and allows individuals to manage their Personal CRM tools.

## The Pro Individual Tier (Personal CRM)
While the mobile app focuses on collecting contacts, the web dashboard is where power users go to execute follow-ups.
- **Desktop Email Drafting:** Typing out long follow-up emails or LinkedIn messages is vastly superior on a physical desktop keyboard.
- **Deep Analytics:** Viewing rich charts of exactly which portfolio links are converting, and mapping out the geographic hotspots of where they met people.

### 1. The Template Designer (Brand Control)
This is a desktop-class WYSIWYG editor tailored for corporate marketing teams.
- **Brand Lock:** The admin designs the "Master Template" (uploading the corporate logo, setting the exact hex colors, and locking the font).
- **Permissions Engine:** The admin dictates what fields an employee is allowed to edit. For example, they can lock the "Company Name" and "Logo" so they cannot be altered, but allow the employee to edit their "Phone Number" and "Headshot".
- **Global Link Sync:** The admin can push a global link to the back of all employee cards instantly (e.g., a link to a new webinar or a "Book a Demo" link).

### 2. User & Seat Management
Managing the paid subscriptions and employee access.
- **Provisioning:** Invite employees via email or SSO (Okta/Google Workspace integration).
- **Grouping:** Organize employees by department or region (e.g., "North America Sales", "Engineering Team").
- **Offboarding:** Instantly revoke a former employee's access to the corporate card template when they leave the company.

### 3. Analytics & Reporting
Metrics need to prove the ROI of physical events and individual performance, moving beyond vanity metrics into actionable data.
- **Event ROI & Campaign Tracking:** By tying collected cards to "Active Folders" (e.g., "Tech Fair 2026"), companies can see exactly how many unique contacts were acquired during a specific event, helping them justify the cost of flights and sponsorships.
- **Link Conversion & A/B Testing:** Track not just scans, but *actions*. If the card has a general "Careers Page" link and a specific "Apply Now" link, the dashboard shows which one actually drives traffic.
- **Engagement Funnel:** Track the drop-off rate: *Master QR Scanned* -> *Card Saved to Contacts* -> *Follow-up Link Clicked*.
- **Geographic Hotspots:** A heatmap of where cards are being scanned, helping agencies identify which cities or regions yield the most fruitful networking.
- **Team Leaderboards:** See which individual recruiters or sales reps are collecting the most contacts and generating the most scans, driving friendly competition.

### 4. Enterprise CRM Integrations
Solving the biggest pain point for B2B sales teams.
- **Centralized Sync:** Instead of relying on individual reps to manually enter collected business cards into the CRM, the dashboard automatically routes all contacts collected by *any* employee (via NFC or QR) directly into the corporate Salesforce, HubSpot, or Microsoft Dynamics instance.
- **Lead Tagging:** Automatically tag leads with the event name if the employee used an "Active Folder" (e.g., Tag: `Source: Tech Fair 2026`).
