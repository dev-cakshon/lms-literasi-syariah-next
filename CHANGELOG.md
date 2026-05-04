# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-05-04

### Added

- **Activity Gamification System** — new gamification activity type for courses with full admin editor and student-facing interfaces; activity results show correct answer count; admin can delete activities; auth sync and badge payload wired to activity completion
- **Certificate System** — students earn and download a PDF certificate upon course completion with a perfect activity score; celebration modal on unlock; re-access from dashboard; certificate types and API client functions added to data layer
- **Google Slides Chapter Media** — chapters now support Google Slides alongside video; new `SlidesPlayer` component for student chapter viewer; admin chapter editor updated with media type selector; chapter media fetched via new backend media endpoint
- **Hard Delete User** — admins can permanently delete a user account
- `app.js` startup file and adjusted package config for Vercel deployment

### Changed

- Full design system foundation introduced with consolidated UI components
- Dashboard and gamification views fully redesigned with a new visual language
- Glassmorphism treatment on `ProfileOverview`
- Geometric divider and serif `h1` rollout across key headings
- Updated leaderboard color palette
- Scrollable achievements badge list
- Enrollment flow removed; course access is now open by default
- Indonesian copy corrections across admin and search UI
- Aligned shadcn primary token with the emerald color system

### Fixed

- Certificate modal not triggering after last chapter completion or on perfect activity score
- Certificate download errors on the dashboard certificate component
- `ProgressRing` percentage display and color consistency
- Image-not-found fallback
- Chapter reorder delay
- Media view error with proper fallback state

## [0.1.0] - 2026-04-08

### Added

- Authentication: login, signup, role-based access (student / admin) via Firebase Auth
- Course catalog with enrollment flow
- Course viewer: chapter content (Tiptap-rendered), chapter completion tracking
- Quizzes with scoring and badge awards (`perfect_score`, `top_3`)
- Admin panel: full course CRUD, chapter management, user management
- Student dashboard: profile overview, achievement badges, real-time leaderboard
- Real-time leaderboard via Firestore `onSnapshot` with current-user rank display
- Chatbot assistant integration
- Gamification: badge award modal, points system
- Drag-and-drop chapter reordering (admin)
- File uploads via uploadthing

### Known Limitations

- No backend automated tests; no frontend integration tests (2 unit tests only)
- Chatbot requires external API credentials (`NEXT_PUBLIC_CHATBOT_API_BASE` / `NEXT_PUBLIC_CHATBOT_API_KEY`)
