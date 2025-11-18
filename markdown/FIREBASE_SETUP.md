# Firebase Setup Guide

## Prerequisites

- A Firebase account (free tier is sufficient)
- Node.js installed

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `lms-literasi-syariah` (or your preferred name)
4. Disable Google Analytics (optional for LMS)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable sign-in methods:
   - ✅ **Email/Password** - Click and enable
   - ✅ **Google** (optional) - Click, enable, and add support email

## Step 3: Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Select **Start in test mode** (for development)
4. Choose location closest to your users (e.g., `asia-southeast2` for Indonesia)
5. Click "Enable"

### Update Security Rules (After Testing)

Once you're ready for production, update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Anyone can read courses and chapters
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth != null; // Admin only in production
    }

    match /chapters/{chapterId} {
      allow read: if true;
      allow write: if request.auth != null; // Admin only in production
    }

    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null; // Admin only in production
    }

    // Users can read/write their own enrollments and progress
    match /enrollments/{enrollmentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
    }

    match /progress/{progressId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
    }
  }
}
```

## Step 4: Enable Storage (For Course Images/Videos)

1. In Firebase Console, go to **Storage**
2. Click "Get started"
3. Accept the default security rules
4. Click "Done"

## Step 5: Get Firebase Configuration

1. In Firebase Console, click the **gear icon** ⚙️ (Project Settings)
2. Scroll down to "Your apps"
3. Click the **Web icon** `</>`
4. Register your app with a nickname: `lms-web-app`
5. Copy the `firebaseConfig` object

## Step 6: Configure Environment Variables

1. Create `.env.local` file in the root of your project:

```bash
cp .env.example .env.local
```

2. Add your Firebase credentials to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 7: Seed Initial Data

Install tsx for running the seed script:

```bash
pnpm install -D tsx
```

Add seed script to `package.json`:

```json
{
  "scripts": {
    "seed": "tsx src/lib/seedFirestore.ts"
  }
}
```

Run the seed script:

```bash
pnpm run seed
```

This will populate your Firestore with:

- ✅ Categories (6 Islamic finance categories)
- ✅ Courses (6 courses)
- ✅ Chapters (11 chapters across 3 courses)

## Step 8: Verify Setup

1. Start your development server:

```bash
pnpm run dev
```

2. Check Firestore Console to see your data
3. Test authentication by implementing a login page

## Next Steps

### Implement Authentication UI

- Create login/signup pages
- Add protected routes
- Display user info in navbar

### Switch from Dummy Data to Firebase

Replace imports in your components:

```typescript
// Old
import { dummyCourseData } from '@/lib/dummyData';

// New
import { getCourse, getCourseChapters } from '@/lib/firestore';

const courseData = await getCourse(courseId);
const chapters = await getCourseChapters(courseId);
```

### Add AuthProvider to Layout

Wrap your app with AuthProvider in `app/layout.tsx`:

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

## Firestore Data Structure

```
courses/
  {courseId}/
    - title: string
    - description: string
    - imageUrl: string
    - price: number
    - categoryId: string
    - isPublished: boolean

chapters/
  {chapterId}/
    - courseId: string
    - title: string
    - description: string
    - videoUrl: string
    - position: number
    - isFree: boolean
    - isPublished: boolean

users/
  {userId}/
    - email: string
    - displayName: string
    - role: "student" | "instructor" | "admin"

enrollments/
  {userId}_{courseId}/
    - userId: string
    - courseId: string
    - enrolledAt: timestamp
    - status: "active" | "completed"

progress/
  {userId}_{courseId}/
    - userId: string
    - courseId: string
    - completedChapters: string[]
    - lastAccessedChapter: string
    - updatedAt: timestamp

categories/
  {categoryId}/
    - name: string
    - icon: string
```

## Troubleshooting

### Firebase not initialized

- Check that `.env.local` exists and has correct values
- Restart dev server after adding env variables

### Permission denied

- Update Firestore security rules
- Check that user is authenticated for protected operations

### Seed script fails

- Ensure Firebase config is correct
- Check Firebase Console for quota limits
- Verify Firestore is enabled

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Getting Started](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
