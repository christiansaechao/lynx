# Data Model & Contexts

This document outlines the core data structures used by Lynx, focusing on the two distinct user contexts for the business card.

## User Contexts
The application supports two primary modes for the front of the card. This allows the exact same elegant, minimalist UI layout to serve both professionals and job seekers.

### 1. Employed / Business Profile
For users who are currently employed and representing their status within an organization.
- `companyName`: Displayed prominently at the top. (e.g., "Pierce & Pierce")
- `fullName`: Displayed dead center. (e.g., "Patrick Bateman")
- `jobTitle`: Displayed below the name. (e.g., "Vice President")
- `department`: Displayed below title or company. (e.g., "Mergers and Acquisitions")
- `location`: Bottom corner. (e.g., "New York, NY")
- `phone`: Bottom corner. 
- `email`: Bottom corner.

### 2. Job Seeker / Student Profile
For users without a company anchor, focusing on their personal brand, target roles, and education.
- `headline`: Replaces the company name at the top. (e.g., "Software Engineering", "Creative Direction")
- `fullName`: Displayed dead center.
- `targetRole`: Replaces the job title. (e.g., "Full-Stack Developer")
- `education`: Replaces the department. (e.g., "B.S. Computer Science, Univ. of Washington")
- `location`: Bottom corner. 
- `phone`: Bottom corner. 
- `email`: Bottom corner.

## Back of Card (Links)
The reverse side of the card contains a dynamic array of links that are translated into QR codes.

**Link Object:**
- `id`: Unique identifier
- `platform`: (e.g., "LinkedIn", "GitHub", "Personal Portfolio")
- `url`: The destination URL
- `isActive`: Boolean (allows users to hide links without deleting them)
