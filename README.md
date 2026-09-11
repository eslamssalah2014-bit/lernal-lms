# 🚀 LERNAL LMS — SINCE 2026

> **"Learning should be an adventure, not a chore."**  
> Complete, production-ready Learning Management System custom-engineered for **LERNAL**, targeted specifically at children (ages 4–16) and their parents.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg)](https://supabase.com/)
[![Bunny.net](https://img.shields.io/badge/Bunny.net-Stream_CDN-orange.svg)](https://bunny.net/)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend_Deploy-black.svg)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-Backend_Deploy-46e3b7.svg)](https://render.com/)

---

## 📖 Project Overview

**LERNAL LMS** is a modern, high-performance, and kid-safe Learning Management System built for next-generation education. It merges vibrant gamification with enterprise-grade operational tooling for administrators, teachers, and parents.

### Core Highlights:
- **Kid-First Gamification:** Experience points (XP), streak tracking, celebratory confetti animations, and milestone badges that keep young learners motivated.
- **Parental Visibility & Control:** Real-time child academic progress tracking, attendance logs, and frictionless tuition invoice management.
- **Enterprise Operations Suite:** Comprehensive Leads CRM pipeline, Course Builder studio, Testing & Quiz engine, and Finance/Invoice tracking.
- **Cryptographic Video Protection:** Video streaming delivered via **Bunny.net Stream CDN** using time-limited HMAC-SHA256 signature tokens signed exclusively by the backend.
- **Multi-Cloud Architecture:** Optimized for **Vercel** (Frontend SPA), **Render** (Backend API), and **Supabase** (PostgreSQL RLS).

---

## ✨ Key Features

### 🎓 For Students
- **Interactive Video Classroom:** Fluid playback powered by Bunny Stream with bookmarking and progress tracking.
- **Gamified Quizzes:** Automated scoring, instant feedback, XP awards, and streak multipliers.
- **Achievement Vault:** Dynamic badges celebrating milestones (e.g. *"First Step"*, *"Quiz Whiz"*, *"Math Magician"*).

### 👨‍👩‍👧 For Parents
- **Multi-Child Dashboard:** Switch seamlessly between children to view grades, course progress, and upcoming sessions.
- **Tuition & Billing Portal:** Transparent fee schedules, invoice history, and 1-click payment confirmations.

### 👑 For Administrators & Instructors
- **Leads Center CRM:** Kanban-style lead progression from initial inquiry to paid enrollment with conversion tracking.
- **Course & Curriculum Builder:** Multi-module course composer supporting video attachments, quizzes, and downloadable resources.
- **Testing Module:** Comprehensive question bank builder supporting multiple-choice, true/false, and auto-graded assessments.
- **Finance Module:** Revenue summaries, pending invoice aging, and payment reconciliation.
- **1-Click Demo Role Switcher:** Instant role emulation (Admin, Student, Parent, Instructor, Guest) in the navigation bar for frictionless evaluation.

---

## 🏗️ Architecture Diagram

```
                                  +-----------------------------+
                                  |       Web Browser Client    |
                                  | (Students, Parents, Admins) |
                                  +--------------+--------------+
                                                 |
                                         HTTPS / REST API
                                                 |
                                                 v
                                  +-----------------------------+
                                  |      Frontend (Vercel)      |
                                  |  - React 18 + Vite (SPA)    |
                                  |  - Tailwind CSS Brand Tokens|
                                  |  - SPA Rewrites vercel.json |
                                  +-------+--------------+------+
                                          |              |
                    Direct Video Embed    |              | REST API Calls
                 (Signed Tokenized URL)   |              | (Bearer JWT)
                                          |              v
+-----------------------------+           |   +-----------------------------+
|    Bunny.net Video Stream   |           |   |       Backend (Render)      |
|  - Global CDN Edge Network  |<----------+   |  - Express REST API         |
|  - Token Authentication     |               |  - HMAC-SHA256 Token Signer |
|  - Dynamic Expiration       |<--------------+  - Zod Validation & RBAC    |
+-----------------------------+   Token Sign  +--------------+--------------+
                                     Request                 |
                                                             | Connection Pool
                                                             | (Row Level Security)
                                                             v
                                              +-----------------------------+
                                              |     Database (Supabase)     |
                                              |  - PostgreSQL 15+ Engine    |
                                              |  - RLS Policies & Triggers  |
                                              |  - Normalized DDL Schema    |
                                              +-----------------------------+
```

For detailed architectural specifications, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti | High-performance gamified UI ready for **Vercel** |
| **Backend** | Node.js 20, Express 4, TypeScript, Zod, JWT | Secure REST API engine ready for **Render** |
| **Database** | Supabase (PostgreSQL 15+), Row Level Security (RLS) | Relational data persistence with strict security boundaries |
| **Video Streaming** | Bunny.net Stream CDN | Token-authenticated video delivery with HMAC-SHA256 signatures |
| **DevOps & VCS** | Git, GitHub, Conventional Commits | Professional multi-branch development lifecycle |

---

## 📁 Repository Structure

```
lernal-lms/
├── frontend/                   # React 18 + Vite Frontend (Vercel ready)
│   ├── public/assets/          # Brand logos and iconography
│   ├── src/
│   │   ├── components/common/  # LernalLogo, Navbar, Footer, LeadCaptureModal
│   │   ├── context/            # AuthContext with 1-click role switcher
│   │   ├── pages/public/       # HomePage, CourseCatalogPage, CourseDetailsPage
│   │   ├── pages/student/      # StudentDashboardPage, CoursePlayerPage, QuizTakePage
│   │   ├── pages/parent/       # ParentDashboardPage (Billing & Children Progress)
│   │   ├── pages/admin/        # Leads CRM, Finance, Courses, Testing, Rosters
│   │   ├── services/           # api.ts (REST client with token interceptor)
│   │   └── types/              # TypeScript schemas & contracts
│   ├── .env.example            # Frontend environment variable blueprint
│   ├── tailwind.config.js      # Brand color tokens & design system
│   ├── vercel.json             # Single Page Application (SPA) routing rewrites
│   └── vite.config.ts          # Dev server with proxy to backend
│
├── backend/                    # Node.js + Express + TypeScript API (Render ready)
│   ├── src/
│   │   ├── data/               # In-memory database pre-seeded with rich demo datasets
│   │   ├── middleware/         # JWT authentication, RBAC guards, error handlers
│   │   ├── routes/             # auth, courses, videos, leads, finance, tests, student, parent, admin
│   │   ├── services/           # bunnyStream.ts (HMAC-SHA256 token signer)
│   │   └── server.ts           # Express server entry point & health check
│   ├── .env.example            # Backend environment variable blueprint
│   ├── package.json
│   └── tsconfig.json
│
├── database/                   # Supabase PostgreSQL Migrations
│   ├── schema.sql              # Normalized DDL schema with RLS, foreign keys & indexes
│   └── seed.sql                # Production-realistic seed data (users, courses, quizzes, leads)
│
├── docs/                       # Project Documentation Suite
│   ├── ARCHITECTURE.md         # Full architectural design & data flow specifications
│   ├── API.md                  # Comprehensive REST API endpoint reference
│   ├── DEPLOYMENT.md           # Production deployment guide (Vercel, Render, Supabase, Bunny)
│   └── WORKFLOW.md             # Git branching, Conventional Commits & PR checklist
│
├── .env.example                # Root environment template with placeholders
├── .gitignore                  # Production-grade gitignore
├── package.json                # Root orchestration scripts
├── README.md                   # Project overview & documentation
└── start-lernal.ps1            # 1-click local launch script for Windows
```

---

## ⚙️ Environment Variables

Copy the provided root `.env.example` into `.env` (never commit real `.env` files):

```bash
cp .env.example .env
```

| Variable | Scope | Description |
|---|---|---|
| `PORT` | Backend | HTTP port for backend API (Default: `5000`) |
| `NODE_ENV` | Backend | Application environment (`development` / `production`) |
| `JWT_SECRET` | Backend | Secret key used to sign and verify JWT authentication tokens |
| `BACKEND_URL` | Backend | Base URL of deployed backend API (e.g. `https://lernal-lms-api.onrender.com`) |
| `FRONTEND_URL` | Backend | Base URL of deployed frontend client (e.g. `https://lernal-lms.vercel.app`) |
| `SUPABASE_URL` | Backend / DB | Supabase project URL (`https://xyz.supabase.co`) |
| `SUPABASE_ANON_KEY` | Both | Public anonymous Supabase key for client queries |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Elevated service key for backend administrative operations |
| `BUNNY_API_KEY` | Backend | Bunny.net Stream management API key |
| `BUNNY_LIBRARY_ID` | Backend | Bunny.net Video Library ID |
| `BUNNY_CDN_HOSTNAME` | Both | Pull Zone hostname (e.g., `vz-xxxx.b-cdn.net` or `video.lernal.edu`) |
| `BUNNY_TOKEN_AUTH_KEY` | Backend | Token Authentication secret used for HMAC-SHA256 URL signing |
| `BUNNY_TOKEN_EXPIRATION_HOURS`| Backend | Lifetime of signed video playback URLs (e.g., `6`) |
| `VITE_API_URL` | Frontend | API endpoint consumed by frontend client |
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL for frontend client |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase public anon key for frontend client |
| `VITE_BUNNY_CDN_HOSTNAME` | Frontend | Bunny Stream CDN hostname for iframe playback |

---

## 🛠️ Installation & Local Development Setup

### Prerequisites
- **Node.js**: v18.x or v20.x LTS installed
- **npm**: v9.x or higher
- **Git**: v2.30+

### 1. Clone Repository & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/<your-username>/lernal-lms.git
cd lernal-lms

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Local Environment
```bash
# Create local env files from templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Launch Services Concurrently

#### Option A: Quick-launch via PowerShell (Windows)
```powershell
.\start-lernal.ps1
```

#### Option B: Launch Manually in Separate Terminals

**Terminal 1 — Backend REST API:**
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

**Terminal 2 — Frontend Client:**
```bash
cd frontend
npm run dev
# Client running at http://localhost:5173
```

Visit **http://localhost:5173** in your browser. Use the **Demo Role** switcher in the top navigation bar to test all user roles.

---

## 🚀 Deployment Instructions

### 1. 🗄️ Supabase Configuration (Database)
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Execute `database/schema.sql` to establish tables, constraints, indexes, and Row Level Security (RLS).
4. Execute `database/seed.sql` to populate sample courses, accounts, quizzes, and leads.
5. Retrieve your project URL, `anon` key, and `service_role` key from **Project Settings > API**.

### 2. 🐰 Bunny Stream Configuration (Video CDN)
1. Log in to [bunny.net](https://bunny.net) and create a **Video Library** under **Stream**.
2. Note your **Library ID** and **API Key**.
3. Under **Security > Token Authentication**, enable Token Authentication and save the secret key as `BUNNY_TOKEN_AUTH_KEY`.
4. Configure or copy your **Pull Zone CDN Hostname** (e.g., `vz-xxxx.b-cdn.net`).

### 3. 🖥️ Render Deployment (Backend API)
1. Connect your repository on [render.com](https://render.com) and create a **Web Service**.
2. Configure settings:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
3. Add backend environment variables (Supabase keys, Bunny credentials, JWT secret).
4. Note your public backend URL (e.g. `https://lernal-lms-api.onrender.com`).

### 4. 🌐 Vercel Deployment (Frontend Client)
1. Import `https://github.com/eslamssalah2014-bit/lernal-lms` into [vercel.com](https://vercel.com).
2. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend` (or leave as `./` with included root `vercel.json`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: `https://lernal-lms-api.onrender.com` (or `VITE_API_URL`)
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Public Anon Key
   - `NEXT_PUBLIC_BUNNY_CDN_HOSTNAME`: Your Bunny Stream CDN Hostname
4. Click **Deploy**. The included `vercel.json` applies security headers, static asset caching, and SPA route rewrites.

For full deployment walkthroughs and screenshots, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 🌿 GitHub Workflow & Branching Guidelines

We maintain two primary branches:

- **`main`**: Production-ready code only. Automatically deployed to live environments.
- **`development`**: Active integration branch for testing and feature development.

### Branching Convention:
- `feature/course-management`
- `feature/leads-center`
- `feature/testing-module`
- `feature/finance-module`
- `fix/resolve-enrollment-bug`
- `refactor/optimize-authentication-flow`
- `docs/update-project-documentation`

All commits follow the **Conventional Commits** specification. See [docs/WORKFLOW.md](docs/WORKFLOW.md) for full guidelines.

---

## 📄 License & Attribution

Designed and engineered for **LERNAL LMS — SINCE 2026**. All rights reserved.
