# LMS Literasi Syariah — Frontend

A Learning Management System for Islamic economic literacy. Built with Next.js 15, Firebase, and Tailwind CSS v4.

## Stack

| Layer        | Tech                                               |
| ------------ | -------------------------------------------------- |
| Frontend     | Next.js 15 (App Router), React 19, TypeScript      |
| Styling      | Tailwind CSS v4, shadcn/ui                         |
| Auth & DB    | Firebase Auth + Firestore (client SDK)             |
| Backend API  | `lms-be-firebase` (Firebase Functions + Express 5) |
| Forms        | react-hook-form + zod                              |
| Editor       | Tiptap                                             |
| File uploads | uploadthing                                        |

## Features

### Public / Unauthenticated

- Landing page with hero section, feature highlights, and course preview carousel
- User registration (signup) with automatic role assignment
- Login with role-based redirect: student → `/dashboard`, admin → `/admin/course`

### Student

- **Dashboard** — profile overview with avatar, total points, earned badges, certificate list, and real-time leaderboard (top 10 via Firestore `onSnapshot`)
- **My Courses** — enrolled course list with search, progress percentage, chapter and activity counts
- **Course overview** — full syllabus with chapters and activities, best scores per activity, certificate modal on completion
- **Chapter content** — YouTube video or slides embed with rich text body; mark-complete button awards 10 points and triggers badge evaluation
- **Three gamification activity types:**
  - **True/False** — statement-based binary questions; choices lock after selection; full result screen on submit
  - **Word Search** — grid-based letter puzzle; auto-submits with confetti animation when all words are found
  - **Drag & Drop** — pair-matching interactive activity with result screen
- **Certificates** — issued when course progress reaches 100% and all activity best scores are perfect; viewable from dashboard or course overview
- **Chatbot** — Islamic Finance AI assistant with session management, message history, and streaming responses

### Admin

- **Course management** — create, edit metadata (title, description, thumbnail), publish/unpublish, delete
- **Chapter management** — create, edit (title, media URL, media type, rich text content via Tiptap), delete
- **Activity management** — create and edit True/False, Word Search, and Drag & Drop activities
- **User management** — search by name or email, assign roles (student / instructor / admin), delete users

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
| View / earn certificate       | Student | `/course/[courseId]` → certificate modal                 |
| View leaderboard              | Student | `/dashboard`                                             |
| Use chatbot                   | Student | `/chatbot`                                               |
| Create / edit / delete course | Admin   | `/admin/course`                                          |
| Edit chapter                  | Admin   | `/admin/course/[courseId]/chapter/[chapterId]`           |
| Edit activity                 | Admin   | `/admin/course/[courseId]/activity/[activityId]/…`       |
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

# Chatbot
NEXT_PUBLIC_CHATBOT_API_BASE=
NEXT_PUBLIC_CHATBOT_API_KEY=

# Firebase client config (from Firebase Console → Project Settings → Your apps)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

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
│   └── (main)/                      # Auth-gated shell (ProtectedRoute)
│       ├── (student)/
│       │   ├── dashboard/           # /dashboard — profile, badges, leaderboard, certs
│       │   ├── my-courses/          # /my-courses — enrolled courses + progress
│       │   ├── chatbot/             # /chatbot — AI assistant
│       │   └── (course)/
│       │       └── course/[courseId]/
│       │           ├── page.tsx                        # Course overview + syllabus
│       │           ├── chapter/[chapterId]/            # Chapter content viewer
│       │           ├── activity/[activityId]/
│       │           │   ├── true-or-false/              # True/False activity player
│       │           │   ├── word-search/                # Word Search activity player
│       │           │   └── drag-drop/                  # Drag & Drop activity player
│       │           └── quiz/[quizId]/                  # Redirects → course overview
│       └── admin/                   # Admin-only (roles={['admin']})
│           ├── course/              # /admin/course — course list + create
│           │   └── [courseId]/
│           │       ├── page.tsx                        # Course detail + content list
│           │       ├── chapter/[chapterId]/            # Chapter editor
│           │       ├── activity/[activityId]/
│           │       │   ├── true-or-false/              # True/False activity editor
│           │       │   └── word-search/                # Word Search activity editor
│           │       └── drag-drop/[activityId]/         # Drag & Drop activity editor
│           └── user/                # /admin/user — user management
├── components/                      # 75+ UI components organised by feature domain
├── contexts/                        # AuthContext — Firebase Auth state + profile
├── hooks/                           # useLeaderboard, useCourseProgress (Firestore real-time)
├── lib/                             # api.ts, firebase.ts, chatbot.ts, wordSearch.ts, …
└── types/                           # index.ts — all shared TypeScript interfaces
```
