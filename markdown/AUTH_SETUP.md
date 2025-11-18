# Authentication Implementation

## Overview
The LMS now has complete authentication using Firebase Auth with the following features:
- ✅ Email/Password authentication
- ✅ Google Sign-In
- ✅ Protected routes
- ✅ Public landing page
- ✅ Login/Signup pages
- ✅ User session management

## Routes

### Public Routes (No Auth Required)
- `/` - Landing page
- `/login` - Login page
- `/signup` - Signup page

### Protected Routes (Auth Required)
- `/dashboard` - User dashboard
- `/browse` - Browse courses
- `/my-courses` - User's enrolled courses
- `/course/:id` - Course details and chapters

## Components

### AuthContext (`src/contexts/AuthContext.tsx`)
Provides authentication state and methods throughout the app:
- `user` - Current user object (null if not logged in)
- `loading` - Auth state loading status
- `signIn(email, password)` - Email/password login
- `signUp(email, password)` - Email/password registration
- `signInWithGoogle()` - Google authentication
- `signOut()` - Logout

### ProtectedRoute (`src/components/ProtectedRoute.tsx`)
Wrapper component that:
- Redirects to `/` if user is not authenticated
- Shows loading spinner while checking auth state
- Renders children only when user is logged in

### Usage Example
```tsx
// In any component
"use client";
import { useAuth } from "@/contexts/AuthContext";

export const MyComponent = () => {
  const { user, signOut } = useAuth();
  
  return (
    <div>
      <p>Hello, {user?.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};
```

## How It Works

1. **Root Layout** (`src/app/layout.tsx`)
   - Wraps entire app with `<AuthProvider>`
   - Makes auth context available everywhere

2. **Landing Page** (`src/app/(landing-page)`)
   - No protection
   - Shows "Masuk" and "Daftar" buttons in navbar
   - Accessible by anyone

3. **Main Layout** (`src/app/(main)/layout.tsx`)
   - Wrapped with `<ProtectedRoute>`
   - Redirects to `/` if not logged in
   - Contains dashboard, browse, my-courses

4. **Course Layout** (`src/app/(course)/layout.tsx`)
   - Wrapped with `<ProtectedRoute>`
   - Protects all course content
   - Only authenticated users can access

5. **Sidebar** (`src/components/sidebar/Sidebar.tsx`)
   - Shows user email
   - "Keluar" button to sign out
   - Only visible in protected routes

## User Flow

### New User
1. Visit landing page `/`
2. Click "Daftar" → `/signup`
3. Register with email/password or Google
4. Auto-redirected to `/dashboard`
5. Can now access all courses

### Returning User
1. Visit landing page `/`
2. Click "Masuk" → `/login`
3. Login with email/password or Google
4. Auto-redirected to `/dashboard`
5. Can continue learning

### Logged In User
1. Navigate anywhere in the app
2. User info shown in sidebar
3. Click "Keluar" to sign out
4. Redirected to landing page `/`

## Firebase Setup Required

Before authentication works, you need to:

1. **Create `.env.local`** with Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

2. **Enable Authentication Methods** in Firebase Console:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
   - Enable "Google" (add support email)

3. **Add Authorized Domains**:
   - In Firebase Console → Authentication → Settings
   - Add your domains (localhost is enabled by default)

See `FIREBASE_SETUP.md` for detailed setup instructions.

## Testing

### Test Without Firebase
The app will show errors if Firebase isn't configured. To test:
1. Set up Firebase project (see above)
2. Add credentials to `.env.local`
3. Restart dev server: `pnpm run dev`

### Test Auth Flow
1. Visit `http://localhost:3000/`
2. Should see landing page (public)
3. Click "Daftar" → should see signup form
4. Try to visit `/dashboard` directly → should redirect to `/`
5. Sign up with test email
6. Should redirect to `/dashboard`
7. Sidebar should show email and "Keluar" button

## Security Notes

- All API keys in `.env.local` are prefixed with `NEXT_PUBLIC_` because Firebase SDK runs client-side
- Protected routes are client-side protected (users can't access without login)
- For production, implement server-side auth checks in API routes
- Use Firestore security rules to protect data (see `FIREBASE_SETUP.md`)

## Next Steps

1. **Add User Profiles**: Create user documents in Firestore on signup
2. **Email Verification**: Require email verification before accessing courses
3. **Password Reset**: Add "Forgot Password" flow
4. **Social Login**: Add more providers (Facebook, GitHub, etc.)
5. **Admin Roles**: Add role-based access control for instructors/admins
6. **Session Persistence**: Already handled by Firebase automatically
