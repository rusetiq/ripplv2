<p align="center">
  <img src="public/rippl-icon.svg" alt="RIPPL Logo" width="80" height="80" />
</p>

<h1 align="center">RIPPL</h1>

<p align="center">
  <strong>Translating private daily habits into visible, verified environmental progress</strong>
</p>

<p align="center">
  <a href="https://saarthai.web.app/"><img src="https://img.shields.io/badge/Launch_Platform-10B981?style=for-the-badge&logo=rocket&logoColor=white" alt="Launch Platform" /></a>
  <a href="https://saarthai.web.app/"><img src="https://img.shields.io/badge/Verification-AI--Powered-06B6D4?style=for-the-badge&logo=google&logoColor=white" alt="Verification" /></a>
  <a href="https://saarthai.web.app/"><img src="https://img.shields.io/badge/Database-Firestore-F59E0B?style=for-the-badge&logo=firebase&logoColor=white" alt="Database" /></a>
</p>

<p align="center">
  <a href="#core-system-features">System Features</a> •
  <a href="#technical-stack-overview">Tech Stack</a>
</p>

<hr style="border: 0; border-top: 1px solid rgba(167, 154, 124, 0.15); margin: 30px 0;" />

> [!NOTE]
> Individual climate actions often feel isolated when viewed alone. RIPPL is built on a simple principle: small, consistent choices, also referred to as ripples, made by many individuals accumulate into massive, measurable ecological shifts.

---

## Core System Features

### 1. Verifiable Action Logging
Personal habit tracking has traditionally relied on unverified self-reporting. RIPPL introduces a rigorous proof-based workflow for documenting daily green actions. Users select from curated categories, each mapped to specific environmental benefits:

| Category | Action Types | Environmental Impact Metrics |
| :--- | :--- | :--- |
| **Transport** | Metro commuting, carpooling, cycling, walking routes | Kilograms of Carbon Dioxide saved |
| **Food** | Plant-based meals, zero waste practices, organic ingredients | Carbon footprint reduction |
| **Energy** | Solar energy, AC set to 24C, efficient lighting, smart power | Kilowatt-hours conserved |
| **Water** | Short showers, greywater reuse, optimized laundry cycles | Liters of fresh water preserved |
| **Waste** | Recycling, organic composting, zero single-use plastics | Landfill diversion volume |

<details>
  <summary><strong>Click to view Advanced Proof Verification Spec</strong></summary>
  <br />

To preserve the integrity of the ecosystem and prevent artificial metrics, every logged action requires photographic evidence:

* **Captured Intent**: Users submit a real-time photographic record of their activity.
* **Automated Assessment**: The platform performs an automatic verification check on the submitted visual proof, analyzing the image for contextual evidence and determining the confidence level before any credits are issued.
* **Integrity Control**: Submissions that fail to reach the verification threshold or do not match the selected category are rejected, keeping the leaderboard reliable.
</details>

### 2. Gamification and Progress Tracking
Sustainable choices are reinforced through an elegant progress engine that turns daily wins into structural milestones:
* **Streaks**: Consecutive daily logs build active streaks, highlighting long-term commitment.
* **Levels**: Earning points unlocks new player tiers, representing cumulative growth.
* **Badges**: Special milestones yield unlockable achievements for transit patterns, water-saving targets, and high-frequency energy savings.
* **Impact Quantification**: The platform translates actions into direct environmental metrics, focusing on carbon dioxide prevented and fresh water preserved.

### 3. The Rewards Ecosystem
Points earned through confirmed activities hold real-world value. RIPPL partners with local transit operators, eco-friendly merchants, and environmental conservation projects to offer a robust redemption store:
* **Transit Passages**: Unlimited public transit passes.
* **Conscious Dining**: Vouchers for partner cafes serving organic, locally-sourced items.
* **Coastal Reforestation**: Direct redemption to sponsor the planting of native coastal flora in critical regional zones.
* **Reusable Gear**: Premium travel cups, zero-plastic household starter kits, and self-watering interior gardening systems.
* **Clean Tech**: Portable high-capacity solar chargers for mobile electronics.

### 4. Competitive Rankings
RIPPL turns solitary choices into collaborative competition:
* **Peer Competition**: Connect with friends and family to compare streaks and weekly point totals.
* **National Standing**: Participate in a regional leaderboard that highlights leading contributors and promotes nationwide momentum.
* **Weekly Resets**: Leaderboard resets ensure that new participants always have a fair opportunity to reach the top rankings.

### 5. Corporate Integrations
The platform extends its utility to organizations striving to meet environmental objectives and elevate employee engagement:
* **Strategic ESG Dashboarding**: Organizations track aggregated carbon offset metrics and water conservation figures generated by their workforce.
* **Sponsorships and Branding**: Corporations integrate their own sustainable initiatives, sponsor reward packages, or run targeted campaign pathways within the application.
* **Verification Integrations**: Custom interfaces allow corporate partners to validate carbon-conscious commutes and office habits on-site.

---

## Technical Stack Overview

While focused primarily on user experience, the system utilizes a modern, resilient architecture:
* **Frontend**: Highly responsive React framework with interactive Framer Motion animations.
* **Styling**: Tailored, component-based styles built with Tailwind CSS.
* **Database & Auth**: Firebase Firestore for real-time document sync and Google Auth for identity management.
* **Icons**: Crisp, uniform SVG icons from Lucide React.
