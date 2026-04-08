# Frontend Architecture Decision Record

This document captures architectural decisions for the frontend. It is a living record: each completed journey adds new sections with final decisions and rationale.

## Scope

- Repository: `lms-next`
- Current coverage: Journey 1 decisions
- Audience: frontend developers and AI agents working in this codebase

## Decision Format

Each section should document:

- Decision
- Rationale
- Constraints

When adding decisions for future journeys:

- Append new sections
- Keep existing sections intact
- Do not delete or overwrite prior journey decisions

## Journey 1: Authentication and Signup Flow

### Decision

Backend owns Firebase account creation entirely.

Frontend must never call `createUserWithEmailAndPassword` directly.

The required signup sequence is:

1. Call `POST /v1/auth/register` (unauthenticated)
2. Call `signInWithEmailAndPassword`
3. Call `getIdToken(true)` to force refresh
4. Call `fetchProfile`

### Rationale

Account creation and profile provisioning must stay authoritative in backend workflows. The frontend only authenticates after backend registration and then synchronizes identity/profile state.

### Constraints

- Signup orchestration must follow the exact order above
- No client-side shortcut that bypasses backend registration is allowed

## Journey 1: Login and Role-Based Redirect

### Decision

Redirect destination is determined from Firebase ID token claims, not from waiting on `/auth/me`.

Before reading claims with `getIdTokenResult()`, frontend must call `getIdToken(true)` to ensure custom role claims have propagated.

Redirect rules:

- `student` -> `/dashboard`
- `admin` -> `/admin/course`

### Rationale

Claims are available directly on the authenticated session and are the earliest reliable signal for role-based routing, provided token refresh is forced first.

### Constraints

- Always force-refresh before reading claims for redirect decisions
- Do not block redirect logic on profile endpoint timing

## Journey 1: Auth Listener Race Condition Guard

### Decision

`AuthContext` uses an `isSigningUp` ref to suppress `onAuthStateChanged` side effects during signup orchestration.

`isSigningUp` is always reset in a `finally` block.

### Rationale

`onAuthStateChanged` can fire immediately after Firebase auth completion, while backend profile creation may not be ready yet. The guard prevents premature profile fetch behavior during the controlled signup sequence.

### Constraints

- Listener suppression must remain active only for signup orchestration window
- Guard reset in `finally` is mandatory to avoid stale suppression state

## Journey 1: API Layer and Type Safety

### Decision

All backend calls must go through `src/lib/api.ts` without exception.

No component may call `fetch` directly against backend endpoints.

All API responses must be typed against `src/types/index.ts` and must not use `any`.

### Rationale

A single API abstraction enforces consistent headers, error handling, response parsing, and future cross-cutting concerns. Strict typing prevents contract drift and hidden runtime errors.

### Constraints

- Backend integration code belongs in API layer, not UI components
- Response contracts must use shared frontend types
- `any` is disallowed for API response typing

## Journey 1: Public Course Visibility Safety

### Decision

Landing-page `CourseSection` must filter publish visibility with strict equality:

- `course.isPublished === true`

Any ambiguous, missing, or non-true publish value defaults to hidden for public pages.

### Rationale

Public content must fail closed. Uncertain publish state should never leak to unauthenticated users.

### Constraints

- Do not use permissive checks (for example nullish coalescing to `true`) for public publish filtering
- Public course rendering must remain explicit and conservative
