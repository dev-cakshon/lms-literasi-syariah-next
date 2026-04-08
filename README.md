# LMS Literasi Syariah — Frontend

A Learning Management System for Islamic economic literacy. Built with Next.js 15, Firebase, and Tailwind CSS v4.

## Stack

| Layer        | Tech                                               |
| ------------ | -------------------------------------------------- |
| Frontend     | Next.js 15 (App Router), React 19, TypeScript      |
| Styling      | Tailwind CSS v4                                    |
| Auth & DB    | Firebase Auth + Firestore (client SDK)             |
| Backend API  | `lms-be-firebase` (Firebase Functions + Express 5) |
| Forms        | react-hook-form + zod                              |
| Editor       | Tiptap                                             |
| File uploads | uploadthing                                        |

## Features (v0.1.0)

- Authentication (login, signup, role-based access)
- Course catalog, course detail, chapter content, and quizzes
- Admin: full course CRUD, user management
- Student: personal dashboard, leaderboard, gamification badges
- Real-time leaderboard via Firestore `onSnapshot`
- Chatbot assistant

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
NEXT_PUBLIC_API_URL=http://localhost:5001/<project-id>/us-central1/api

# Firebase client config (from Firebase Console → Project Settings → Your apps)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Chatbot
NEXT_PUBLIC_CHATBOT_API_BASE=
NEXT_PUBLIC_CHATBOT_API_KEY=
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
│   ├── (landing-page)/   # Login, signup
│   ├── (main)/
│   │   ├── (student)/    # Student dashboard, my courses
│   │   └── admin/        # Admin course & user management
│   └── (course)/         # Course viewer, chapters, quizzes
├── components/           # Shared UI components
├── contexts/             # AuthContext
├── hooks/                # use-realtime (Firestore subscriptions)
├── lib/                  # api.ts, firebase.ts, utilities
└── types/                # Shared TypeScript types
```
