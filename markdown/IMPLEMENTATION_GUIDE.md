# LMS MVP Features - Implementation Guide

## 🚀 What's Been Implemented

I've added the foundational infrastructure for your LMS MVP features. Here's what's ready:

### ✅ Completed Features

#### 1. **User Role System**
- Added role-based permissions (student, instructor, admin)
- Updated AuthContext to fetch and manage user roles
- Created Firestore user profiles collection
- Type-safe role checking with `isInstructor` and `isAdmin` flags

#### 2. **Instructor Dashboard Routes**
- Created `/teacher` route group for instructors
- Added `/teacher/courses` page for course management
- Added `/teacher/analytics` page for stats and insights
- Protected routes - only instructors can access

#### 3. **Type Definitions**
All types defined in `src/types/index.ts`:
- `UserProfile` - User with role
- `Course` - Course with metadata
- `Chapter` - Course content modules
- `Quiz` & `QuizQuestion` - Assessment system
- `Assignment` & `AssignmentSubmission` - Homework system
- `UserProgress` - Progress tracking
- `Enrollment` - Course enrollments

#### 4. **Firestore Operations**
Extended `src/lib/firestore.ts` with:
- User profile CRUD
- Course CRUD (create, update, delete, publish)
- Chapter CRUD (create, update, delete, reorder)
- Query helpers for instructor courses
- New collections: quizzes, assignments, submissions

#### 5. **UI Updates**
- Sidebar shows "Mode Instruktur" button for instructors
- Navbar shows mode toggle
- Role-based navigation

---

## 🎯 What Exists Already (From Your Project)

Your project already has:
- ✅ Authentication (email/password + Google)
- ✅ Student dashboard with leaderboard
- ✅ Course browsing and search
- ✅ Basic progress tracking structure
- ✅ Firestore integration
- ✅ UI component library (shadcn/ui)

---

## 📋 What Still Needs to be Built

### Priority 1: Course Management UI (Required for MVP)
**What**: Create the interface for instructors to manage courses

**Files to Create**:
```
src/app/(main)/teacher/courses/
├── page.tsx                    # List all instructor's courses
├── create/
│   └── page.tsx                # Create new course form
└── [courseId]/
    ├── page.tsx                # Edit course details
    ├── chapters/
    │   └── page.tsx            # Manage course chapters
    └── settings/
        └── page.tsx            # Course settings

src/components/teacher/
├── CourseForm.tsx              # Form to create/edit course
├── CourseList.tsx              # List of instructor's courses
├── CourseCard.tsx              # Card for each course
├── ChapterForm.tsx             # Form to create/edit chapters
└── ChapterList.tsx             # List of chapters with reordering
```

**Features to Implement**:
- Create course form (title, description, price, category)
- Edit course details
- Delete course (with confirmation)
- Publish/Unpublish toggle
- Image upload for course thumbnail
- Add/remove course attachments

**Example Implementation**:
```typescript
// src/app/(main)/teacher/courses/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createCourse } from '@/lib/firestore';

export default function CreateCoursePage() {
    const [title, setTitle] = useState('');
    const { user } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        const newCourse = await createCourse(user.uid, title);
        router.push(`/teacher/courses/${newCourse.id}`);
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Buat Kursus Baru</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Judul Kursus"
                    className="w-full p-2 border rounded"
                    required
                />
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
                    Buat Kursus
                </button>
            </form>
        </div>
    );
}
```

---

### Priority 2: Chapter Management
**What**: Allow instructors to add and organize course content

**Files to Create**:
```
src/components/chapters/
├── ChapterList.tsx             # Draggable list of chapters
├── ChapterItem.tsx             # Individual chapter with edit/delete
├── ChapterForm.tsx             # Create/edit chapter form
└── ChapterReorder.tsx          # Drag-and-drop interface
```

**Libraries to Install**:
```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Features**:
- Add new chapter
- Edit chapter (title, description, duration)
- Delete chapter
- Reorder chapters (drag and drop)
- Mark chapter as free preview
- Publish/unpublish chapter

---

### Priority 3: Content Upload & Delivery
**What**: Upload videos, PDFs, and display them to students

**Files to Create**:
```
src/lib/storage.ts              # Firebase Storage upload utilities
src/components/content/
├── FileUpload.tsx              # Generic file upload component
├── VideoPlayer.tsx             # Video player component
├── PdfViewer.tsx               # PDF viewer component
└── TextEditor.tsx              # Rich text editor for instructors
```

**Libraries to Install**:
```bash
pnpm add react-player           # For video playback
pnpm add react-pdf              # For PDF viewing
pnpm add @tiptap/react @tiptap/starter-kit  # For text editing
```

**Storage Functions**:
```typescript
// src/lib/storage.ts
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export async function uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: number) => void
): Promise<string> {
    const storage = getStorage();
    const storageRef = ref(storage, path);
    
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress?.(progress);
            },
            (error) => reject(error),
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });
}

export async function uploadVideo(file: File, courseId: string, chapterId: string) {
    return uploadFile(file, `courses/${courseId}/chapters/${chapterId}/video.mp4`);
}

export async function uploadPdf(file: File, courseId: string) {
    return uploadFile(file, `courses/${courseId}/attachments/${file.name}`);
}
```

---

### Priority 4: Quiz System
**What**: Create and take quizzes with auto-grading

**Files to Create**:
```
src/app/(main)/teacher/courses/[courseId]/chapters/[chapterId]/quiz/
└── create/
    └── page.tsx                # Create quiz form

src/app/(main)/course/[courseId]/chapter/[chapterId]/quiz/
├── [quizId]/
│   ├── page.tsx                # Take quiz
│   └── result/
│       └── page.tsx            # Quiz results

src/components/quiz/
├── QuizBuilder.tsx             # Create quiz interface
├── QuestionForm.tsx            # Add/edit questions
├── QuizTaker.tsx               # Student quiz interface
└── QuizResults.tsx             # Show results
```

**Firestore Operations to Add**:
```typescript
// Add to src/lib/firestore.ts
export async function createQuiz(chapterId: string, courseId: string, title: string) {
    const quizRef = collection(db, COLLECTIONS.QUIZZES);
    const newQuiz = {
        chapterId,
        courseId,
        title,
        questions: [],
        passingScore: 70,
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(quizRef, newQuiz);
    return { id: docRef.id, ...newQuiz };
}

export async function submitQuizAttempt(
    userId: string,
    quizId: string,
    answers: number[]
) {
    // Calculate score
    const quiz = await getDoc(doc(db, COLLECTIONS.QUIZZES, quizId));
    const quizData = quiz.data();
    
    let correctAnswers = 0;
    quizData.questions.forEach((q: any, index: number) => {
        if (q.correctAnswer === answers[index]) {
            correctAnswers++;
        }
    });
    
    const score = (correctAnswers / quizData.questions.length) * 100;
    const passed = score >= quizData.passingScore;
    
    // Save attempt
    const attemptRef = collection(db, COLLECTIONS.QUIZ_ATTEMPTS);
    const attempt = {
        userId,
        quizId,
        answers,
        score,
        passed,
        completedAt: new Date().toISOString(),
    };
    
    await addDoc(attemptRef, attempt);
    return { score, passed };
}
```

---

### Priority 5: Assignment System
**What**: Create assignments, submit work, grade submissions

**Files to Create**:
```
src/app/(main)/teacher/courses/[courseId]/chapters/[chapterId]/assignment/
└── create/
    └── page.tsx                # Create assignment

src/app/(main)/teacher/assignments/
└── page.tsx                    # Grade submissions

src/app/(main)/course/[courseId]/chapter/[chapterId]/assignment/
└── page.tsx                    # Submit assignment

src/components/assignments/
├── AssignmentForm.tsx          # Create assignment
├── AssignmentSubmit.tsx        # Student submission form
├── SubmissionList.tsx          # List of submissions (instructor)
└── GradingInterface.tsx        # Grade individual submission
```

---

### Priority 6: Progress Tracking UI
**What**: Visual indicators of student progress

**Components to Create**:
```
src/components/progress/
├── ProgressBar.tsx             # Horizontal progress bar
├── ProgressCircle.tsx          # Circular progress indicator
├── CompletionButton.tsx        # Mark chapter as complete
└── CourseProgress.tsx          # Overall course progress card
```

**Update Existing Pages**:
```typescript
// src/app/(main)/course/[courseId]/chapter/[chapterId]/page.tsx
// Add "Mark as Complete" button that calls:

import { updateUserProgress } from '@/lib/firestore';

async function markComplete() {
    await updateUserProgress(userId, courseId, chapterId, true);
    // Refresh progress
}
```

---

## 🛠️ How to Test Instructor Features

### Method 1: Update User Role in Firestore (Recommended)

1. **Open Firestore Console**:
   - Go to Firebase Console → Firestore Database
   - Find the `users` collection
   - Locate your user document (by UID)

2. **Update Role Field**:
   - Edit the document
   - Change `role` from `"student"` to `"instructor"`
   - Save

3. **Refresh Your App**:
   - Reload the page
   - You should now see "Mode Instruktur" button in sidebar/navbar

### Method 2: Use Browser Console

1. **Import the Utility**:
```typescript
// In your app, temporarily add to a component:
import '@/lib/userRoleUtils';
```

2. **Open Browser Console** and run:
```javascript
// Get your user ID (logged in console or from AuthContext)
await makeInstructor('your-user-id-here');
```

3. **Refresh** the page

### Method 3: Temporary Testing Mode

In `src/contexts/AuthContext.tsx`, line 47:
```typescript
role: "instructor",  // Change from "student" for testing
```

---

## 📦 Additional Libraries You May Need

```bash
# For drag and drop (chapter reordering)
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# For video playback
pnpm add react-player

# For PDF viewing
pnpm add react-pdf

# For rich text editing
pnpm add @tiptap/react @tiptap/starter-kit

# For form validation
pnpm add react-hook-form zod @hookform/resolvers

# For dates
pnpm add date-fns

# For notifications/toasts (if not already installed)
pnpm add sonner
```

---

## 🎨 Recommended UI Pattern

Use your existing UI components from `src/components/ui/`:
- `Button` for actions
- `Input`, `Textarea` for forms
- `Dialog` for modals
- `Card` for containers
- `Badge` for status indicators
- `Progress` for progress bars

Example form pattern:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const courseSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    price: z.number().min(0),
    categoryId: z.string(),
});

type CourseForm = z.infer<typeof courseSchema>;

function CourseForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<CourseForm>({
        resolver: zodResolver(courseSchema),
    });

    const onSubmit = async (data: CourseForm) => {
        // Save course
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* Form fields */}
        </form>
    );
}
```

---

## 📊 Firebase Storage Rules

Add to your Firebase Storage rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Course content
    match /courses/{courseId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;  // Add instructor check in production
    }
    
    // User uploads
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

---

## 🐛 Debugging Tips

1. **Check User Role**:
```javascript
// In browser console:
const { userProfile } = useAuth();
console.log('Current role:', userProfile?.role);
```

2. **Check Firestore Data**:
```javascript
// In browser console:
import { getUserProfile } from '@/lib/firestore';
const profile = await getUserProfile('your-uid');
console.log(profile);
```

3. **Test Firestore Operations**:
```javascript
// In browser console:
import { createCourse } from '@/lib/firestore';
const course = await createCourse('user-123', 'Test Course');
console.log('Created:', course);
```

---

## 📝 Development Workflow

1. **Start with Course CRUD**
   - Create the course list page
   - Add create course form
   - Add edit course page
   - Test publish/unpublish

2. **Add Chapter Management**
   - List chapters for a course
   - Add create chapter form
   - Implement reordering
   - Test chapter CRUD

3. **Implement Content Upload**
   - Add video upload
   - Add PDF upload
   - Create viewers
   - Test on student side

4. **Build Assessment System**
   - Create quiz builder
   - Build quiz taking interface
   - Implement auto-grading
   - Test full flow

5. **Add Progress Tracking**
   - Add complete buttons
   - Show progress bars
   - Update dashboard
   - Add instructor view

---

## ✅ Testing Checklist

### As Student:
- [ ] Can browse courses
- [ ] Can view course details
- [ ] Can watch videos
- [ ] Can view PDFs
- [ ] Can mark chapters complete
- [ ] Can take quizzes
- [ ] Can submit assignments
- [ ] Can see progress

### As Instructor:
- [ ] Can access teacher mode
- [ ] Can create course
- [ ] Can edit course
- [ ] Can delete course
- [ ] Can publish/unpublish
- [ ] Can add chapters
- [ ] Can upload content
- [ ] Can create quizzes
- [ ] Can create assignments
- [ ] Can grade submissions
- [ ] Can view analytics

---

## 🆘 Need Help?

If you encounter issues:
1. Check the console for errors
2. Verify Firestore permissions
3. Check user authentication state
4. Review the MVP_STATUS.md file
5. Check type definitions in src/types/index.ts

---

## 🎉 You're Ready!

The foundation is set. You now have:
- ✅ User role system
- ✅ Instructor routes
- ✅ Type definitions
- ✅ Firestore operations
- ✅ Utility functions

Start building the UI components and connect them to these backend functions. Follow the priorities above, and you'll have a fully functional LMS MVP!

Good luck! 🚀
