# LERNAL LMS — REST API SPECIFICATION

All endpoints are prefixed with `/api`. Protected routes require the standard header:
`Authorization: Bearer <JWT_TOKEN>`

---

## 🚦 System & Health

### `GET /api/health`
Checks server responsiveness and environment status.
- **Access:** Public
- **Response 200 OK:**
  ```json
  {
    "status": "healthy",
    "service": "Lernal LMS API Engine",
    "version": "1.0.0",
    "tagline": "SINCE 2026",
    "timestamp": "2026-09-11T05:50:00.000Z",
    "environment": "production",
    "architecture": {
      "frontend": "Vercel",
      "backend": "Render",
      "database": "Supabase PostgreSQL",
      "videoStreaming": "Bunny.net Stream"
    }
  }
  ```

---

## 🔐 Authentication & Session (`/api/auth`)

### `POST /api/auth/login`
Authenticates a user and returns a signed JWT token.
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "student@lernal.edu",
    "password": "securePassword123"
  }
  ```
- **Response 200 OK:**
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "usr_student_01",
      "name": "Leo Wright",
      "email": "student@lernal.edu",
      "role": "student"
    }
  }
  ```

### `POST /api/auth/switch-role` (Demo Evaluation Utility)
Allows 1-click role emulation for reviewers and evaluators.
- **Request Body:** `{ "role": "admin" | "student" | "parent" | "instructor" }`
- **Response 200 OK:** Returns new JWT token and corresponding profile.

---

## 📚 Courses & Curriculum (`/api/courses`)

### `GET /api/courses`
Fetch published course catalog with pricing, grade band, and rating.
- **Access:** Public

### `GET /api/courses/:id`
Fetch course syllabus, modules, and lessons.
- **Access:** Public (free preview lessons visible; locked lessons require enrollment)

### `POST /api/courses`
Create a new course curriculum.
- **Access:** Admin, Instructor

---

## 🎥 Video Protection & Bunny Stream (`/api/videos`)

### `GET /api/videos/lessons/:lessonId/access`
Generates a cryptographically signed HMAC-SHA256 URL token for streaming via Bunny.net.
- **Access:** Enrolled Student, Parent of Student, Admin, Instructor
- **Logic:**
  1. Checks if the requested lesson is a free preview or if user has active enrollment.
  2. Generates dynamic expiration epoch timestamp.
  3. Signs token: `SHA256(BUNNY_TOKEN_AUTH_KEY + videoId + expirationTimestamp)`.
- **Response 200 OK:**
  ```json
  {
    "videoId": "bunny_vid_9941a",
    "libraryId": "123456",
    "streamUrl": "https://video.lernal.edu/embed/bunny_vid_9941a?token=a8f...&expires=1789098800",
    "expiresAt": "2026-09-11T14:00:00.000Z"
  }
  ```

---

## 🎯 Leads CRM (`/api/leads`)

### `POST /api/leads`
Captures new inquiry from homepage/landing modal.
- **Access:** Public

### `GET /api/leads`
Retrieves pipeline leads, status stages (`new`, `contacted`, `trial_scheduled`, `enrolled`).
- **Access:** Admin

### `PATCH /api/leads/:id/status`
Updates lead status and progression stage.
- **Access:** Admin

---

## 📝 Testing & Quizzes (`/api/tests`)

### `GET /api/tests/course/:courseId`
List available quizzes and assessments.
- **Access:** Student, Instructor, Admin

### `POST /api/tests/:testId/submit`
Submit quiz answers, automatically computes score and awards XP.
- **Access:** Student
- **Response 200 OK:**
  ```json
  {
    "score": 90,
    "totalQuestions": 10,
    "passed": true,
    "xpEarned": 50,
    "streakBonus": 10
  }
  ```

---

## 💳 Finance & Billing (`/api/finance`)

### `GET /api/finance/invoices`
Fetch tuition invoices and payment statuses.
- **Access:** Admin (all), Parent (own children only)

### `POST /api/finance/invoices/:id/pay`
Mark invoice paid or process gateway confirmation.
- **Access:** Admin, Parent
