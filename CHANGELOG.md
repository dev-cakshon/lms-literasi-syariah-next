# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
