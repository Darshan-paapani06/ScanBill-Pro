<div align="center">

<img src="animated-title.svg" width="800" alt="ScanBill Pro"/>

**A refined barcode billing dashboard with intelligent discovery, animated classical design, and a polished point-of-sale workflow.**

<br/>

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61dafb?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat-square&logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20+-5fa04e?style=flat-square&logo=nodedotjs&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-d4a843?style=flat-square)

<br/>

`html5-qrcode` &nbsp;·&nbsp; `jsonwebtoken` &nbsp;·&nbsp; `motion/react` &nbsp;·&nbsp; `OpenFoodFacts` &nbsp;·&nbsp; `Gemini AI`

</div>

<img src="animated-divider.svg" width="800" alt=""/>

## 📖 What is ScanBill Pro?

ScanBill Pro is a premium retail dashboard built for modern point-of-sale experiences. It combines **live webcam barcode scanning**, **secure JWT authentication**, **AI-backed barcode lookup**, and a **fully editable product catalog** into one elegant web interface.

Built with a retail-first mindset — fast scanning, clear product insight, rich transaction receipts, and secure access control. Every interaction is intentionally animated and crafted to feel polished, responsive, and delightful.

<img src="animated-divider.svg" width="800" alt=""/>

## 🎯 Project Goals

| # | Goal |
|:--|:-----|
| `01` | Fast, accurate barcode scanning directly in the browser via webcam |
| `02` | Intelligent product resolution for both standard and custom barcodes |
| `03` | Clear, actionable inventory management with real-time inline editing |
| `04` | Secure, maintainable collection of sale transactions with printable receipts |
| `05` | A strong, extensible baseline for production-grade POS experiences |

<img src="animated-divider.svg" width="800" alt=""/>

## 🎨 Design Philosophy

ScanBill Pro is built with a deliberate design system that prioritises clarity, speed, and delight. Visual hierarchy emerges from depth, soft shadows, and layered cards. Motion is used to guide attention — never to distract.

**Design Tokens:**

| Token | Hex | Usage |
|:------|:----|:------|
| 🟡 Gold Highlight | `#d4a843` | Decorative accents |
| 🟠 Amber | `#c98a3e` | Interactive elements |
| 🟤 Dark Canvas | `#1a110a` | Background |
| 🟢 Sage Confirm | `#4a7c59` | Success states |
| 🔴 Ember Danger | `#8b3a1e` | Destructive actions |
| 🟡 Amber Alert | `#f59e0b` | Low stock warnings |
| 🟣 Violet Accent | `#6d28d9` | Primary actions |
| 🟢 Emerald | `#10b981` | Confirmations |

<img src="animated-divider.svg" width="800" alt=""/>

## 🏗️ Architecture

```
ScanBill Pro
├── Frontend
│   ├── App Shell
│   │   ├── Top Navigation
│   │   ├── Status Panel
│   │   ├── Animated Dashboard Cards
│   │   └── Quick Action Buttons
│   ├── Scan Workspace
│   │   ├── Webcam Scanner Panel
│   │   ├── Scan History Feed
│   │   ├── Active Receipt Preview
│   │   └── Auto-Discovery Info Tile
│   ├── Product Catalog Modal
│   │   ├── Search Bar + Sort Controls
│   │   ├── Editable Product Table
│   │   ├── Product Lightbox Preview
│   │   └── Add / Delete Product Actions
│   ├── Receipt Modal
│   │   ├── Print Optimised Invoice
│   │   ├── Transaction Summary
│   │   ├── Tax & Total Calculations
│   │   └── Payment Status Badge
│   ├── Authentication Screens
│   │   ├── Login & Registration Pages
│   │   ├── Token Storage (LocalStorage)
│   │   └── Session Refresh Logic
│   └── Micro Animations
│       ├── Hover & Focus States
│       ├── Pulse Alerts (low stock)
│       ├── Modal Entrance / Exit
│       └── Table Row Transitions
├── Backend
│   ├── Express API
│   │   ├── POST /api/auth/login
│   │   ├── POST /api/auth/register
│   │   ├── GET  /api/auth/me
│   │   ├── GET  /api/products
│   │   ├── POST /api/scan
│   │   ├── GET  /api/scan-stream  (SSE)
│   │   └── POST /api/products/bulk
│   ├── Security Layer
│   │   ├── JWT Middleware
│   │   ├── Role Validation
│   │   ├── Authorization Guards
│   │   └── Secret Management (.env)
│   ├── Barcode Intelligence
│   │   ├── OpenFoodFacts Lookup
│   │   ├── Gemini AI Fallback
│   │   ├── Deterministic Generator
│   │   └── Metadata Sanitisation
│   ├── Transaction Engine
│   │   ├── Receipt Number Generator
│   │   ├── Item Totals & Tax Calculator
│   │   └── Receipt Serialisation
│   ├── Scanner Stream (SSE)
│   │   ├── SSE Client Registry
│   │   ├── Scan Broadcasting
│   │   └── Physical Scanner Hooks
│   └── In-Memory Data Store
│       ├── Products DB
│       ├── Scan Logs
│       ├── Transaction History
│       └── User Accounts
└── Developer Experience
    ├── Local Dev Server (Vite)
    ├── Environment Configuration
    ├── Startup Scripts (npm run dev)
    ├── Debug Logging
    └── Tailored Error Messages
```

<img src="animated-divider.svg" width="800" alt=""/>

## 🔄 Workflow: From Scan to Receipt

**`Step 1` — Launch & Authenticate**
The UI shell initialises with dark theme and motion. Users log in or register with email and password. A JWT token is created, stored in LocalStorage, and validated via `/api/auth/me` to unlock the full dashboard.

**`Step 2` — Begin Scan Session**
The webcam scanner panel activates via `html5-qrcode` and listens continuously. When a valid barcode is detected, a `POST /api/scan` request fires instantly. A live scan history feed keeps the operator aware of recent activity.

**`Step 3` — Intelligent Product Lookup**
Known items display with price, stock, and image immediately. Unknown barcodes trigger the **three-tier fallback engine**: OpenFoodFacts → Gemini AI → deterministic generator — so the checkout flow is never blocked.

**`Step 4` — Build the Receipt**
Each scanned item glides into the active receipt tile with an animated entrance. Subtotal, tax, and grand total recalculate in real time. Low-stock items pulse with a warm amber warning.

**`Step 5` — Manage Catalog (anytime)**
The product catalog modal is always accessible. Operators can search, sort, filter, edit prices, adjust stock levels, delete obsolete SKUs, and add new items — all protected by token-based security.

**`Step 6` — Finalise & Print**
Confirm checkout to generate a unique receipt number and store the transaction in history. The receipt modal scales into view with a polished print-ready invoice.

**`Step 7` — Continue Sales**
A gentle fade resets the scan session. The catalog and history persist across sessions. Repeat the loop — fast, accurate, and delightful every time.

<img src="animated-divider.svg" width="800" alt=""/>

## ✨ Features

### Core Capabilities

| Feature | Description |
|:--------|:------------|
| 📷 **Smart Scanner** | Browser-based barcode scanning via `html5-qrcode`. Responsive panel adapts to mobile and desktop. Physical scanner hookup via POST + SSE. |
| 🧠 **AI Barcode Intelligence** | Three-tier lookup: OpenFoodFacts → Gemini AI → deterministic generator. Checkout is never blocked by missing data. |
| 🛡️ **Secure Auth** | JWT login, registration, and session validation. Role-aware endpoints guard every protected operation. |
| 🗂️ **Live Catalog Management** | Real-time inline editing. Search, sort, and filter controls. Stock-level pulse indicators. Bulk import endpoint ready. |
| 🧾 **Receipt Engine** | Printable invoice with itemised totals, automatic tax calculation, and payment status badges. |
| ✨ **Animated UI** | Motion-driven entrances/exits, hover states, pulse alerts, and a consistent animation language via `motion/react`. |

### Complete Feature List

<details>
<summary><b>View all 20 features</b></summary>

- ✅ Live barcode scanning with webcam camera
- ✅ Intelligent automatic product detection
- ✅ AI-powered fallback lookup (Gemini)
- ✅ OpenFoodFacts public product database integration
- ✅ Deterministic fallback product generator
- ✅ Product catalog management with inline editing
- ✅ Receipt generation and print-ready invoice
- ✅ Low-stock alert animations and warnings
- ✅ JWT login and secure API access
- ✅ Scan stream endpoint for external devices (SSE)
- ✅ Bulk product ingestion support
- ✅ Real-time transaction totals and tax calculations
- ✅ Dark theme aesthetic with gold accent highlights
- ✅ Smooth modal transitions and hover effects
- ✅ Custom product image previews and lightbox
- ✅ Search and sort capabilities in catalog
- ✅ Transaction receipt summary and history
- ✅ Backend request logging and debug outputs
- ✅ Token refresh and session validation support
- ✅ Simple deploy scripts via npm

</details>

<img src="animated-divider.svg" width="800" alt=""/>

## 🚀 Installation

> **Note:** If you don't have a Gemini API key, the app still works — AI enrichment is optional.

**1. Clone the Repository**

```bash
git clone https://github.com/<username>/barcode-billing-dashboard.git
cd barcode-billing-dashboard
```

**2. Install Dependencies**

```bash
npm install
```

**3. Configure Environment**

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here
```

**4. Start Dev Server**

```bash
npm run dev
```

**5. Open in Browser**

```
http://localhost:3000
```

**Production Mode**

```bash
npm start
```

<img src="animated-divider.svg" width="800" alt=""/>

## 📁 Project Structure

```
barcode-billing-dashboard/
├── .env                   # GEMINI_API_KEY, JWT_SECRET
├── index.html             # Vite entry point
├── package.json
├── server.js              # Express API + scanner engine (compiled)
├── server.ts              # TypeScript source
├── tsconfig.json
├── vite.config.ts
├── database.sql           # Schema reference
├── metadata.json
├── requirements.txt
└── src/
    ├── App.tsx            # Application shell
    ├── main.tsx           # React entry point
    ├── main.js
    ├── index.css          # Global styles
    ├── types.ts           # Shared TypeScript interfaces
    └── components/
        ├── ProductCatalogModal.tsx
        └── ReceiptModal.tsx
```

<img src="animated-divider.svg" width="800" alt=""/>

## 🛒 Usage Scenarios

<details>
<summary><b>Scenario 01 — Quick Retail Checkout</b></summary>

1. Open the app and log in as cashier
2. Activate the camera scanner
3. Scan barcode after barcode
4. Watch items appear in the transaction tile
5. Print the receipt at end of sale

</details>

<details>
<summary><b>Scenario 02 — Inventory Audit</b></summary>

1. Open the product catalog modal
2. Search for a SKU or barcode
3. Edit price or stock values inline
4. Delete obsolete items
5. Add missing inventory manually

</details>

<details>
<summary><b>Scenario 03 — AI Catalog Discovery</b></summary>

1. Scan an unknown barcode
2. Let the AI lookup engine attempt a match
3. Review and accept generated product details
4. Add the item to the live catalog

</details>

<details>
<summary><b>Scenario 04 — Physical Scanner Hookup</b></summary>

1. Connect an external barcode scanner
2. Send scan events to `POST /api/scan`
3. Subscribe to SSE via `/api/scan-stream`
4. Monitor activity in real time

</details>

<img src="animated-divider.svg" width="800" alt=""/>

## 🔧 Extending ScanBill Pro

| Extension | Description |
|:----------|:------------|
| 👥 **Admin Dashboard** | Employee management, roles, and audit logs for multi-operator deployments |
| 📊 **Product Analytics** | Top-selling SKUs, scan volume charts, and revenue trends over time |
| 📁 **Barcode Import/Export** | CSV and Excel ingestion and export for bulk catalog management |
| 🏪 **Multi-Store Sync** | Centralised inventory sync layer across multiple locations or terminals |
| 📱 **Mobile Cashier App** | Dedicated mobile-first interface for tablet and handheld POS terminals |
| 🔌 **Hardware Scanner Layer** | WebSocket or HID integration for industrial barcode scanners and printers |
| 📧 **Receipt Emailing** | Send digital receipts directly to customers via email after checkout |

<img src="animated-divider.svg" width="800" alt=""/>

## 🛡️ Security & Production

| Area | Details |
|:-----|:--------|
| 🔒 **JWT Auth** | Every protected endpoint checks for a valid token. Admin operations guarded with role checks. |
| 🗝️ **Secret Management** | Sensitive keys stored in `.env`. Never committed to version control. |
| 🛡️ **Payload Validation** | Backend validates required fields on every product and auth request. |
| 📡 **HTTPS Ready** | Production version should terminate TLS at an edge load balancer with a CDN in front. |
| 🗄️ **Persistent Storage** | Replace the in-memory store with a real database for users, products, and transactions. |

### Maintenance Checklist

- [ ] Verify `JWT_SECRET` is set in production environment
- [ ] Replace in-memory storage with a persistent database
- [ ] Add end-to-end tests for scan and checkout flows
- [ ] Build better offline support for the scanner panel
- [ ] Improve error messages for network failures
- [ ] Add analytics for scan volume and product usage
- [ ] Tune UI animations for lighter CPU usage
- [ ] Add rate limiting to all public auth endpoints

<img src="animated-divider.svg" width="800" alt=""/>

## 🧪 Testing & Validation

- ✅ Login and token validation
- ✅ Protected backend API routes
- ✅ Barcode string sanitisation
- ✅ Product payload field validation
- ✅ Graceful fallback for missing lookup data
- ✅ Transaction total and tax calculations

<img src="animated-divider.svg" width="800" alt=""/>

## 📚 Learning Path

This codebase is excellent for learning:

- How **React + Vite** work together in a modern frontend setup
- How **`motion/react`** orchestrates animations across a UI
- **JWT authentication** patterns for securing API endpoints
- **Three-tier fallback** strategies for data enrichment
- **SSE (Server-Sent Events)** for real-time device streaming

<img src="animated-divider.svg" width="800" alt=""/>

## 👤 Author

<div align="center">

<img src="animated-author.svg" width="800" alt="Darshan Paapani — Lead Artisan"/>

<br/>

> *"ScanBill Pro is built with a top-to-bottom design mindset. Every workflow is mapped, every animation is intentional, and the product is positioned as a premium retail experience — from scan to receipt."*

</div>

<img src="animated-divider.svg" width="800" alt=""/>

<div align="center">

**ScanBill Pro** &nbsp;·&nbsp; Lead Artisan: **Darshan Paapani** &nbsp;·&nbsp; A Curated Retail Ledger

</div>
