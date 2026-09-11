# ==============================================================================
# LERNAL LMS - SUPABASE INTEGRATION & SETUP GUIDE
# Production Guide: PostgreSQL, Supabase Auth, Row Level Security, & Migrations
# ==============================================================================

This guide provides step-by-step instructions to connect **LERNAL LMS** to your Supabase project.

---

## 1. Create a Supabase Project

1. Navigate to [https://database.new](https://database.new) and sign in to your Supabase account.
2. Click **New Project**.
3. Choose your organization, set the project name to **Lernal LMS**, specify a secure database password, and select the region closest to your primary users.
4. Wait approximately 1–2 minutes for the database cluster to provision.

---

## 2. Obtain Your Supabase Credentials

In your Supabase project dashboard:
1. Navigate to **Project Settings** (gear icon) -> **API**.
2. Note down the following values:
   - **Project URL**: `https://<your-project-ref>.supabase.co`
   - **anon / public key**: Used by the frontend client (Vercel)
   - **service_role key**: Used strictly by the backend API engine (Render)

> [!CAUTION]
> Never expose the `service_role` key to the frontend client. It bypasses Row Level Security and must only be stored in your Render backend environment variables or server `.env`.

---

## 3. Apply Database Migrations

You can run the migrations either using the **Supabase Web SQL Editor** or via the **Supabase CLI**.

### Option A: Using the Supabase Web SQL Editor (Recommended for Fast Setup)

1. In your Supabase Dashboard, open the **SQL Editor** from the left sidebar.
2. Click **New query**.
3. Run the migration files in order:
   - **Step 3.1**: Copy the contents of [`database/migrations/001_initial_schema.sql`](../database/migrations/001_initial_schema.sql) into the SQL editor and click **Run**.
     *(Creates all 20+ tables: `roles`, `profiles`, `students`, `parents`, `instructors`, `courses`, `course_categories`, `course_modules`, `lessons`, `videos`, `enrollments`, `student_progress`, `leads`, `lead_notes`, `transactions`, `tests`, `test_questions`, `test_answers`, `test_attempts`, `test_results`, `notifications`, `achievements`, along with indexes and updated_at triggers).*
   - **Step 3.2**: Copy the contents of [`database/migrations/002_row_level_security.sql`](../database/migrations/002_row_level_security.sql) and click **Run**.
     *(Enables RLS on all tables and applies student, parent, instructor, and admin boundary policies).*
   - **Step 3.3**: Copy the contents of [`database/migrations/003_auth_triggers.sql`](../database/migrations/003_auth_triggers.sql) and click **Run**.
     *(Installs the PostgreSQL trigger `handle_new_auth_user()` on `auth.users` to automatically synchronize user signups with `public.profiles`).*
   - **Step 3.4**: Copy the contents of [`database/migrations/004_seed_data.sql`](../database/migrations/004_seed_data.sql) and click **Run**.
     *(Populates realistic initial courses, modules, lessons, Bunny video IDs, test quizzes, CRM leads, and transactions).*

> [!TIP]
> Alternatively, you can run [`database/schema.sql`](../database/schema.sql) followed by [`database/seed.sql`](../database/seed.sql), which contain the consolidated master schema and seed script.

---

## 4. Configure Supabase Authentication

1. In the Supabase dashboard, go to **Authentication** -> **Providers**.
2. Ensure **Email** is **Enabled**.
3. Under **Email Auth**:
   - For immediate developer testing without waiting for confirmation emails, you can optionally toggle **Confirm email** to **OFF** in development. (Keep **ON** for production).
4. Go to **Authentication** -> **URL Configuration**:
   - **Site URL**: Set to your production frontend domain (e.g. `https://lernal-lms.vercel.app` or `http://localhost:5173`).
   - **Redirect URLs**: Add:
     - `http://localhost:5173/**`
     - `https://*.vercel.app/**`
     - `https://your-custom-domain.com/**`

---

## 5. Configure Environment Variables

### A. Local Development

1. In the root directory, create `.env` from `.env.example`:
   ```bash
   # Frontend Variables
   VITE_API_URL=http://localhost:5000/api
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_BUNNY_CDN_HOSTNAME=video.lernal.edu

   # Backend Variables
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=lernal_super_secret_jwt_key_since_2026_kid_safe
   FRONTEND_URL=http://localhost:5173
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Bunny.net Streaming
   BUNNY_API_KEY=your-bunny-stream-api-key
   BUNNY_LIBRARY_ID=12345
   BUNNY_CDN_HOSTNAME=video.lernal.edu
   BUNNY_TOKEN_AUTH_KEY=your-bunny-token-key
   BUNNY_TOKEN_EXPIRATION_HOURS=6
   ```

2. Copy the corresponding `.env` into `backend/.env` and `frontend/.env`.

### B. Production Deployment (Vercel & Render)

#### On Vercel (Frontend Project Settings -> Environment Variables):
- `VITE_API_URL`: `https://lernal-lms-api.onrender.com/api`
- `NEXT_PUBLIC_API_URL`: `https://lernal-lms-api.onrender.com/api`
- `VITE_SUPABASE_URL`: `https://your-project-id.supabase.co`
- `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project-id.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `<your-supabase-anon-key>`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `<your-supabase-anon-key>`
- `VITE_BUNNY_CDN_HOSTNAME`: `video.lernal.edu`

#### On Render (Backend Web Service -> Environment):
- `PORT`: `5000`
- `NODE_ENV`: `production`
- `JWT_SECRET`: `<secure-random-string>`
- `FRONTEND_URL`: `https://your-frontend.vercel.app`
- `SUPABASE_URL`: `https://your-project-id.supabase.co`
- `SUPABASE_ANON_KEY`: `<your-supabase-anon-key>`
- `SUPABASE_SERVICE_ROLE_KEY`: `<your-supabase-service-role-key>`
- `BUNNY_API_KEY`: `<your-bunny-stream-api-key>`
- `BUNNY_LIBRARY_ID`: `<your-bunny-library-id>`
- `BUNNY_CDN_HOSTNAME`: `video.lernal.edu`
- `BUNNY_TOKEN_AUTH_KEY`: `<your-bunny-token-key>`
- `BUNNY_TOKEN_EXPIRATION_HOURS`: `6`

---

## 6. Architecture & Security Verification

### Row Level Security (RLS) Verification
- **Students**:
  - Can only query their own row in `students`, their enrolled courses in `enrollments`, and their test submissions in `test_attempts`.
- **Parents**:
  - Can only query their children's data and their family invoices in `transactions`.
- **Instructors**:
  - Can only query cohorts and syllabi for courses assigned to them in `courses`.
- **Public Guests**:
  - Can submit leads via the contact form into `leads`.
  - Can read published courses and preview lessons.
- **Admins**:
  - Unrestricted access across CRM leads, financial ledger, and student rosters.

### Bunny.net Streaming Video Verification
- Raw video files are **never** stored in Supabase.
- When an authorized student or parent accesses a video, the backend queries the video's `bunny_video_id` from the Supabase `videos` table and generates a short-lived signed token with Bunny CDN.

---

## 7. Starting the Application Locally

```powershell
# In terminal 1 (Backend):
npm --prefix backend run dev

# In terminal 2 (Frontend):
npm --prefix frontend run dev
```

Visit [http://localhost:5173](http://localhost:5173) to explore the fully integrated, Supabase-powered **Lernal LMS**.
