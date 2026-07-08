# LMS Literasi Syariah — Frontend

A Learning Management System for Islamic economic literacy. Built with Next.js 15, Firebase, and Tailwind CSS v4.

## Stack

| Layer        | Tech                                                                                   |
| ------------ | -------------------------------------------------------------------------------------- |
| Frontend     | Next.js 15 (App Router), React 19, TypeScript                                          |
| Styling      | Tailwind CSS v4, shadcn/ui                                                             |
| Auth & DB    | Firebase Auth + Firestore (client SDK)                                                 |
| Backend API  | `lms-be-firebase` (Firebase Functions + Express 5)                                     |
| Forms        | react-hook-form + zod                                                                  |
| Editor       | Tiptap                                                                                 |
| Drag & drop  | @hello-pangea/dnd (admin reorder + drag-drop activity)                                 |
| Confetti     | canvas-confetti (word-search completion)                                               |
| File uploads | Backend signed URL / `POST /v1/media/upload` (via `ImageUpload`) — **not** uploadthing |

## Features

> **Desktop-only (mobile gate).** A global `MobileGate` in the root layout renders a `MobileRedirectScreen` (pointing to the native app via `NEXT_PUBLIC_MOBILE_APP_URL`) for any viewport ≤ 767px. The web app is intended for desktop; phones are routed to the mobile app.

### Public / Unauthenticated

- Landing page with hero section, feature highlights, and course preview carousel
- User registration (signup) with automatic role assignment
- Login with role-based redirect: student → `/dashboard`, admin → `/admin/course`

### Student

- **Dashboard** — profile overview with avatar, total points, earned badges, certificate list, and real-time leaderboard (top 10 via Firestore `onSnapshot`)
- **My Courses** — enrolled course list with search, progress percentage, chapter and activity counts
- **Course overview** — full syllabus with chapters and activities, best scores per activity, a dedicated **"Evaluasi" (quiz) section**, and a certificate modal on completion
- **Chapter content** — YouTube video or slides embed with rich text body; mark-complete button awards 10 points and triggers badge evaluation
- **Three gamification activity types:**
  - **True/False** — statement-based binary questions; choices lock after selection; full result screen on submit
  - **Word Search** — grid-based letter puzzle; auto-submits with confetti animation when all words are found
  - **Drag & Drop** — pair-matching interactive activity with result screen
- **Quizzes (Assessment)** — multiple-choice + short-answer questions with server-side grading and a result screen; optional **countdown timer** (auto-submits on expiry) and **per-question images**. Surfaced ungated in the course's "Evaluasi" section (the certificate stays on the completion rule — see PRD13).
- **Premium course access** — free courses are click-and-play; premium courses show a **gate screen** ("Minta Akses") that submits an enrollment request for admin approval. Distinct gate states for pending / declined / revoked, each with a re-request CTA.
- **Certificates** — issued when course progress reaches 100% and all activity best scores are perfect; viewable from dashboard or course overview
- **Chatbot** — Islamic Finance AI assistant (external SSE-streaming service called directly from the client) with session management and message history. Access is **admin-gated per user** via `chatbotEnabled`; also available as an in-course chat drawer (FAB) that is chapter-aware and hidden on quiz/activity routes

### Admin

- **Course management** — create, edit metadata (title, description, thumbnail), publish/unpublish, set **access tier (free / premium)**, delete
- **Chapter management** — create, edit (title, media URL, media type, rich text content via Tiptap), delete
- **Activity management** — create and edit True/False, Word Search, and Drag & Drop activities
- **Quiz management** — "Daftar Kuis" section per course: create/edit quizzes with MC + short-answer questions, per-question images, time limit, passing grade / retake / show-answers toggles, and **Moodle XML import** for bulk question entry
- **Enrollment management** — `/admin/enrollment` premium request queue: **Pending** tab (approve / decline with reason) and **Enrolled** tab (revoke access with reason)
- **User management** — search by name or email, assign roles (student / instructor / admin), **per-user chatbot access toggle**, hard-delete users, add single users (`AddUserDialog`), and **batch register** students from CSV/xlsx (`/admin/user/batch`, PRD14)

## User Journeys

| Journey                       | Role    | Entry → Destination                                      |
| ----------------------------- | ------- | -------------------------------------------------------- |
| Register account              | Student | `/signup` → `/dashboard`                                 |
| Login                         | Student | `/login` → `/dashboard`                                  |
| Login                         | Admin   | `/login` → `/admin/course`                               |
| Browse courses (public)       | Any     | `/`                                                      |
| View enrolled courses         | Student | `/my-courses`                                            |
| Read chapter content          | Student | `/course/[courseId]/chapter/[chapterId]`                 |
| Complete True/False activity  | Student | `/course/[courseId]/activity/[activityId]/true-or-false` |
| Complete Word Search activity | Student | `/course/[courseId]/activity/[activityId]/word-search`   |
| Complete Drag & Drop activity | Student | `/course/[courseId]/activity/[activityId]/drag-drop`     |
| Take a quiz                   | Student | `/course/[courseId]/quiz/[quizId]`                       |
| Request premium access        | Student | `/course/[courseId]` → premium gate screen               |
| View / earn certificate       | Student | `/course/[courseId]` → certificate modal                 |
| View leaderboard              | Student | `/dashboard`                                             |
| Use chatbot                   | Student | `/chatbot`                                               |
| Create / edit / delete course | Admin   | `/admin/course`                                          |
| Edit chapter                  | Admin   | `/admin/course/[courseId]/chapter/[chapterId]`           |
| Edit activity                 | Admin   | `/admin/course/[courseId]/activity/[activityId]/…`       |
| Edit quiz / import XML        | Admin   | `/admin/course/[courseId]/quiz/[quizId]`                 |
| Approve / revoke enrollment   | Admin   | `/admin/enrollment`                                      |
| Manage users                  | Admin   | `/admin/user`                                            |

## Getting Started

### 1. Start the backend

See `../lms-be-firebase/README.md`. With the Firebase emulator running locally, functions are available at `http://localhost:5001`.

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:

```env
# App environment (e.g. development, staging, production)
NEXT_PUBLIC_APP_ENV=""

# API URL (backend base URL)
NEXT_PUBLIC_API_URL=http://localhost:5001/<project-id>/us-central1/api

# Chatbot (external SSE service, called directly from the client)
NEXT_PUBLIC_CHATBOT_API_BASE=
NEXT_PUBLIC_CHATBOT_API_KEY=

# Firebase client config (from Firebase Console → Project Settings → Your apps)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Optional
NEXT_PUBLIC_MOBILE_APP_URL=     # target of the mobile-redirect screen (viewports ≤ 767px)
NEXT_PUBLIC_SHOW_LOGGER=false   # "true" enables the dev logger
```

Every variable is `NEXT_PUBLIC_*` (browser-exposed) — **never** put a secret here. Only `NEXT_PUBLIC_MOBILE_APP_URL` and `NEXT_PUBLIC_SHOW_LOGGER` are validated by `src/lib/env.ts`; the rest are consumed in `firebase.ts`, `api.ts`, and `chatbot.ts`.

### 3. Run the frontend

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script           | Description                     |
| ---------------- | ------------------------------- |
| `pnpm dev`       | Start dev server                |
| `pnpm build`     | Production build                |
| `pnpm typecheck` | TypeScript type check           |
| `pnpm lint`      | ESLint                          |
| `pnpm test`      | Jest unit tests                 |
| `pnpm seed`      | Seed Firestore with sample data |

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for architectural decision records.

## Project Structure

```
src/
├── app/
│   ├── (landing-page)/              # Public: landing (/), login, signup
│   ├── (main)/                      # Auth-gated shell (ProtectedRoute)
│   │   ├── (student)/
│   │   │   ├── dashboard/           # /dashboard — profile, badges, leaderboard, certs
│   │   │   ├── my-courses/          # /my-courses — enrolled courses + progress
│   │   │   ├── chatbot/             # /chatbot — AI assistant
│   │   │   └── (course)/
│   │   │       └── course/[courseId]/
│   │   │           ├── page.tsx                        # Course overview + syllabus
│   │   │           ├── chapter/[chapterId]/            # Chapter content viewer
│   │   │           ├── activity/[activityId]/
│   │   │           │   ├── true-or-false/              # True/False activity player
│   │   │           │   ├── word-search/                # Word Search activity player
│   │   │           │   └── drag-drop/                  # Drag & Drop activity player
│   │   │           └── quiz/[quizId]/                  # Quiz taking flow (MC + short-answer, timer, images)
│   │   └── admin/                   # Admin-only (roles={['admin']})
│   │       ├── course/              # /admin/course — course list + create
│   │       │   └── [courseId]/
│   │       │       ├── page.tsx                        # Course detail + content & quiz lists
│   │       │       ├── chapter/[chapterId]/            # Chapter editor
│   │       │       ├── activity/[activityId]/
│   │       │       │   ├── true-or-false/              # True/False activity editor
│   │       │       │   └── word-search/                # Word Search activity editor
│   │       │       ├── drag-drop/[activityId]/         # Drag & Drop activity editor (note: nested differently from the student player above)
│   │       │       └── quiz/[quizId]/                  # Quiz editor (XML import, image, timer)
│   │       ├── enrollment/          # /admin/enrollment — premium request queue + revoke
│   │       └── user/                # /admin/user — user management + AddUserDialog
│   │           └── batch/           # /admin/user/batch — batch register (CSV/xlsx, PRD14)
│   └── api/hello/                   # Sample Next.js route handler (not the app backend)
├── components/                      # 110+ UI components organised by feature domain
│                                    #   (course/, ui/, dashboard/, quiz/, course-list/, landing-page/,
│                                    #    chatbot/, navbar/, sidebar/, admin/, activity/, gamification/, …)
├── contexts/                        # AuthContext — Firebase Auth state + profile
├── hooks/                           # use-realtime (useLeaderboard, useCourseProgress),
│                                    #   use-certificates (useMyCertificates), use-debounce
├── lib/                             # api.ts, firebase.ts, chatbot.ts (SSE), wordSearch.ts,
│                                    #   quizXmlImport.ts (Moodle XML), media.ts, courseUtils.ts,
│                                    #   helper.ts, logger.ts, og.ts, env.ts, utils.ts
├── constant/                        # config.ts, env.ts — app config + env accessors
├── styles/                          # globals.css — Tailwind v4 theme + design tokens
├── types/                           # index.ts — all shared TypeScript interfaces
├── __tests__/, __mocks__/,          # Jest suites, module mocks, and shared render/test helpers
│   test-utils/
```

### Plain tree (no annotations)

```
src/
├── app/
│   ├── (landing-page)/
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/
│   │   ├── (student)/
│   │   │   ├── (course)/
│   │   │   │   └── course/[courseId]/
│   │   │   │       ├── activity/[activityId]/
│   │   │   │       │   ├── drag-drop/
│   │   │   │       │   ├── true-or-false/
│   │   │   │       │   └── word-search/
│   │   │   │       ├── chapter/[chapterId]/
│   │   │   │       └── quiz/[quizId]/
│   │   │   ├── chatbot/
│   │   │   ├── dashboard/
│   │   │   └── my-courses/
│   │   └── admin/
│   │       ├── course/[courseId]/
│   │       │   ├── activity/[activityId]/
│   │       │   │   ├── true-or-false/
│   │       │   │   └── word-search/
│   │       │   ├── chapter/[chapterId]/
│   │       │   ├── drag-drop/[activityId]/
│   │       │   └── quiz/[quizId]/
│   │       ├── enrollment/
│   │       └── user/
│   │           └── batch/
│   └── api/hello/
├── components/
│   ├── activity/
│   ├── admin/
│   │   └── activity-forms/
│   ├── auth/
│   ├── chatbot/
│   ├── course/
│   │   └── admin/
│   ├── course-list/
│   ├── dashboard/
│   ├── gamification/
│   ├── landing-page/
│   ├── links/
│   ├── navbar/
│   ├── ornaments/
│   ├── quiz/
│   ├── sidebar/
│   └── ui/
├── constant/
├── contexts/
├── hooks/
├── lib/
│   └── __tests__/
├── styles/
├── types/
├── __tests__/
├── __mocks__/
└── test-utils/
    └── mocks/
```
