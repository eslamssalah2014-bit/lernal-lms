# LERNAL LMS — PRODUCTION DEPLOYMENT GUIDE

This guide provides end-to-end instructions for deploying the Lernal LMS ecosystem across **Vercel** (Frontend), **Render** (Backend), **Supabase** (Database), and **Bunny.net** (Video Streaming).

---

## 1. 🗄️ Supabase Database Setup

1. Log in to [Supabase Dashboard](https://app.supabase.com) and click **New Project**.
2. Set your Project Name (e.g., `lernal-lms-production`) and database password.
3. Under **Project Settings > API**, copy:
   - **Project URL** (`https://xyzcompany.supabase.co`)
   - **anon public API key**
   - **service_role secret API key**
4. Navigate to the **SQL Editor** in the Supabase Dashboard.
5. Copy and execute [database/schema.sql](file:///c:/Users/eslam%20salah%20Hosny/.gemini/antigravity/scratch/lernal-lms/database/schema.sql) to provision:
   - Tables (`users`, `courses`, `enrollments`, `quizzes`, `leads`, `invoices`, etc.)
   - Indexes and Foreign Keys
   - Row Level Security (RLS) policies
6. Execute [database/seed.sql](file:///c:/Users/eslam%20salah%20Hosny/.gemini/antigravity/scratch/lernal-lms/database/seed.sql) to seed default role accounts and sample courses.

---

## 2. 🐰 Bunny.net Video Stream Configuration

1. Log in to [Bunny.net](https://bunny.net) and navigate to **Stream > Video Libraries**.
2. Click **Add Video Library** (e.g., `lernal-courses-prod`).
3. Note your **Library ID** (e.g., `184920`).
4. In **API & Keys**, obtain:
   - **API Key** (Full access or read/write)
   - Under **Security > Token Authentication**:
     - Enable **Token Authentication**.
     - Set your **URL Token Authentication Key**.
5. Set up or note your **Pull Zone CDN Hostname** (e.g., `video.lernal.edu` or `vz-xxxx.b-cdn.net`).
6. Upload your sample or course MP4 files to the library.

---

## 3. 🖥️ Render Backend Deployment (`/backend`)

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New + > Web Service**.
3. Connect your GitHub repository: `https://github.com/<your-username>/lernal-lms`.
4. Configure service settings:
   - **Name:** `lernal-lms-api`
   - **Region:** Frankfurt (EU) or Oregon (US)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   ```env
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=your_super_strong_random_jwt_secret_phrase
   FRONTEND_URL=https://lernal-lms.vercel.app
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   BUNNY_API_KEY=your_bunny_api_key
   BUNNY_LIBRARY_ID=184920
   BUNNY_CDN_HOSTNAME=vz-xxxx.b-cdn.net
   BUNNY_TOKEN_AUTH_KEY=your_bunny_token_auth_secret
   BUNNY_TOKEN_EXPIRATION_HOURS=6
   ```
6. Set **Health Check Path** to: `/api/health`.
7. Click **Create Web Service**. Once deployed, copy your backend URL (e.g., `https://lernal-lms-api.onrender.com`).

---

## 4. 🌐 Vercel Frontend Deployment (`/frontend`)

1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New... > Project** and import your GitHub repository.
3. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Edit and set to `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Expand **Environment Variables** and add:
   ```env
   VITE_API_URL=https://lernal-lms-api.onrender.com/api
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_BUNNY_CDN_HOSTNAME=vz-xxxx.b-cdn.net
   ```
5. Click **Deploy**.
6. The `frontend/vercel.json` ensures all client-side routes (e.g., `/student/dashboard`, `/admin/leads`) automatically rewrite to `/index.html`.

---

## 5. ✅ Post-Deployment Verification

1. Verify backend health endpoint:
   ```bash
   curl https://lernal-lms-api.onrender.com/api/health
   ```
2. Open your Vercel URL in your browser:
   - Test navigating the public course catalog.
   - Use the **Demo Role** dropdown in the header to verify role switching (Admin, Student, Parent, Instructor).
   - Test playing a video lesson with Bunny Stream token generation.
   - Submit a test lead inquiry from the modal.
