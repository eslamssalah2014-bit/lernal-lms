# LERNAL LMS — SYSTEM ARCHITECTURE

> **Tagline:** SINCE 2026 — Kid-Safe, Gamified, High-Performance Learning Management System

---

## 🏛️ High-Level System Architecture

```
                                  +-----------------------------+
                                  |         End Users           |
                                  | (Students, Parents, Admins) |
                                  +--------------+--------------+
                                                 |
                                     HTTPS / Web Browser
                                                 |
                                                 v
                                  +-----------------------------+
                                  |      Frontend (Vercel)      |
                                  |  - React 18 + TypeScript    |
                                  |  - Tailwind CSS + Lucide    |
                                  |  - Single Page App (SPA)    |
                                  +-------+--------------+------+
                                          |              |
                    Direct Video Embed    |              | REST API Calls
                 (Signed Tokenized URL)   |              | (Bearer JWT)
                                          |              v
+-----------------------------+           |   +-----------------------------+
|    Bunny.net Video Stream   |           |   |       Backend (Render)      |
|  - Edge CDN Acceleration    |<----------+   |  - Node.js + Express + TS   |
|  - Token Authentication     |               |  - HMAC-SHA256 Token Signer |
|  - Dynamic Expiration       |<--------------+  - RBAC Middleware (Zod)    |
+-----------------------------+   Token Sign  +--------------+--------------+
                                     Request                 |
                                                             | Connection Pool
                                                             | (Row Level Security)
                                                             v
                                              +-----------------------------+
                                              |     Database (Supabase)     |
                                              |  - PostgreSQL 15+ Engine    |
                                              |  - Relational Schema        |
                                              |  - RLS Policies & Triggers  |
                                              +-----------------------------+
```

---

## 🧩 Architectural Tiers

### 1. Frontend Client (`/frontend`)
- **Hosting Platform:** [Vercel](https://vercel.com)
- **Framework:** React 18 with TypeScript and Vite
- **Styling & Icons:** Tailwind CSS with custom Lernal brand palette (`#00212D`, `#00A9D6`, `#36C7F4`, `#FFB800`, `#FF6B4A`, `#10B981`) and Lucide Icons.
- **State & Routing:** Context API (`AuthContext`), React Router v6 with SPA rewrites (`vercel.json`).
- **Features:**
  - 1-Click Fast Role Switcher (Admin, Student, Parent, Instructor, Guest).
  - Gamified Student Dashboard (XP progress, streaks, badges, confetti rewards).
  - Secure Video Player with dynamic Bunny Stream iframe embedding.
  - Interactive Quiz & Assessment engine.
  - Parent Portal (Tuition invoices, progress charts, child switching).
  - Admin Operations Suite (Leads CRM, Course Builder, Finance, Test Manager, Student Rosters).

### 2. Backend REST API Engine (`/backend`)
- **Hosting Platform:** [Render](https://render.com)
- **Runtime:** Node.js 20+ with Express and TypeScript (`tsx` for dev, `tsc` for production).
- **Security:**
  - JWT token verification and Role-Based Access Control (RBAC).
  - HMAC-SHA256 video token generation for Bunny Stream CDN.
  - Strict input validation with Zod schemas.
  - CORS security policies.
- **Endpoints:**
  - `/api/auth` — Authentication & role session management.
  - `/api/courses` — Course catalog, syllabus, and administrative CRUD.
  - `/api/videos` — Token signing and playback authorization.
  - `/api/leads` — Lead capture, status tracking, conversion pipeline.
  - `/api/finance` — Tuition invoices, payment tracking, revenue analytics.
  - `/api/tests` — Quizzes, automated scoring, gradebooks.
  - `/api/student` — Enrolled courses, XP history, achievements.
  - `/api/parent` — Child progress, attendance, billing history.
  - `/api/admin` — System analytics, metrics, user rosters.
  - `/api/health` — Platform health check for Render uptime monitoring.

### 3. Cloud Database (`/database`)
- **Hosting Platform:** [Supabase](https://supabase.com)
- **Engine:** PostgreSQL 15+
- **Security:** Row Level Security (RLS) enabled on all tables, role-based policies.
- **Data Integrity:** Foreign keys with cascade rules, check constraints, timestamp triggers.
- **Schema Composition (`database/schema.sql`):**
  - `users`, `profiles`, `roles`
  - `courses`, `modules`, `lessons`
  - `enrollments`, `lesson_progress`
  - `quizzes`, `quiz_questions`, `quiz_submissions`
  - `leads`, `lead_notes`
  - `invoices`, `payments`
  - `student_gamification` (XP, badges, streaks)

### 4. Video Streaming Infrastructure
- **Provider:** [Bunny.net](https://bunny.net) (Bunny Stream)
- **Security Architecture:**
  - Direct video MP4/HLS URLs are never published to client bundles.
  - Lessons store only Bunny `video_id`.
  - When a student opens a lesson, frontend requests a signed token from `/api/videos/lessons/:id/access`.
  - Backend verifies enrollment, calculates expiration timestamp (e.g. 6 hours), and generates an SHA-256 HMAC token.
  - Video stream iframe loads with encrypted token query parameter.

---

## 🔒 Security & Protection Policies

1. **Zero Secret Leakage:** All API keys (`SUPABASE_SERVICE_ROLE_KEY`, `BUNNY_API_KEY`, `BUNNY_TOKEN_AUTH_KEY`, `JWT_SECRET`) are stored in server-side environment variables on Render.
2. **Client Scope Limitation:** Only public anon keys and public CDN hostnames are exposed to the frontend bundle via `VITE_` prefixes.
3. **Child Data Safety:** In compliance with COPPA/GDPR-K best practices, student accounts link to parent guardians and restrict external sharing.
