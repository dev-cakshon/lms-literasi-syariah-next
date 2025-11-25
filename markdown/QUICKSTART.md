# 🚀 Quick Start Checklist

## ✅ What's Already Done

- [x] User authentication (email + Google)
- [x] Role-based system (student/instructor/admin)
- [x] Instructor dashboard structure
- [x] Course creation form (working!)
- [x] Course listing page (working!)
- [x] Backend operations (30+ functions)
- [x] Type definitions (complete)
- [x] Navigation updates

## 🎯 Start Here (5 Minutes)

### 1. Become an Instructor
Choose one method:

**Method A: Firestore Console**
```
1. Open Firebase Console
2. Go to Firestore Database
3. Find users → [your-user-id]
4. Edit: role = "instructor"
5. Save
```

**Method B: Browser Console**
```javascript
// Add this import temporarily to any page:
import '@/lib/userRoleUtils';

// Then in console:
await makeInstructor('your-user-id');
```

### 2. Test It Out
```
1. Refresh your app
2. Look for "Mode Instruktur" button in sidebar
3. Click it → goes to /teacher/courses
4. Click "Buat Kursus Baru"
5. Enter a title
6. Submit
7. See your course in the list! 🎉
```

## 📋 Next: Build Missing UI (Priority Order)

### Phase 1: Course Management (HIGH PRIORITY)

#### 1.1 Course Edit Page
**File**: `src/app/(main)/teacher/courses/[courseId]/page.tsx`

**What to build**:
- Form with fields: title, description, price, category
- Image upload component
- Publish/unpublish toggle
- Delete button with confirmation

**Backend functions available**:
```typescript
updateCourse(courseId, updates)
publishCourse(courseId, true/false)
deleteCourse(courseId)
```

**Time**: 2-3 hours

---

#### 1.2 Chapter List
**File**: `src/app/(main)/teacher/courses/[courseId]/chapters/page.tsx`

**What to build**:
- List of chapters with position numbers
- "Add Chapter" button
- Edit/Delete buttons for each chapter
- Drag-and-drop reordering (use @dnd-kit)

**Backend functions available**:
```typescript
createChapter(courseId, title, position)
getCourseChapters(courseId)
updateChapter(chapterId, updates)
deleteChapter(chapterId)
reorderChapters([{id, position}])
```

**Libraries needed**:
```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Time**: 3-4 hours

---

### Phase 2: Content Upload (HIGH PRIORITY)

#### 2.1 Firebase Storage Setup
**File**: `src/lib/storage.ts`

**What to build**:
```typescript
uploadVideo(file, courseId, chapterId) → URL
uploadPdf(file, courseId) → URL
uploadImage(file, path) → URL
```

**Storage rules** (Firebase Console):
```
match /courses/{courseId}/{allPaths=**} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
}
```

**Time**: 1-2 hours

---

#### 2.2 File Upload Component
**File**: `src/components/content/FileUpload.tsx`

**What to build**:
- Drag-and-drop area
- File type validation
- Progress bar
- Preview for images/videos

**Time**: 2-3 hours

---

#### 2.3 Video Upload in Chapter
**Update**: Chapter form to include video upload

**Time**: 1 hour

---

### Phase 3: Student Experience (MEDIUM PRIORITY)

#### 3.1 Course Viewer
**File**: `src/app/(main)/course/[courseId]/page.tsx`

**What to build**:
- Course header with info
- Chapter list (clickable)
- Enrollment button
- Progress indicator

**Time**: 2-3 hours

---

#### 3.2 Chapter Viewer
**File**: `src/app/(main)/course/[courseId]/chapter/[chapterId]/page.tsx`

**What to build**:
- Video player (use react-player)
- PDF viewer (use react-pdf)
- Text content display
- Next/Previous buttons
- "Mark as Complete" button

**Libraries needed**:
```bash
pnpm add react-player react-pdf
```

**Backend function**:
```typescript
updateUserProgress(userId, courseId, chapterId, true)
```

**Time**: 3-4 hours

---

#### 3.3 Progress Tracking UI
**Components**: 
- `ProgressBar.tsx`
- `ProgressCircle.tsx`
- `CompletionButton.tsx`

**What to build**:
- Visual progress indicators
- Update on chapter completion
- Show on dashboard

**Time**: 2-3 hours

---

### Phase 4: Assessments (MEDIUM PRIORITY)

#### 4.1 Quiz Builder (Instructor)
**File**: `src/app/(main)/teacher/courses/[courseId]/chapters/[chapterId]/quiz/create/page.tsx`

**What to build**:
- Quiz title/description form
- Add question interface
- Multiple choice options
- Mark correct answer
- Set passing score
- Time limit option

**Firestore operations to add**:
```typescript
// Add to firestore.ts
createQuiz(chapterId, courseId, title)
updateQuiz(quizId, updates)
addQuestion(quizId, question)
```

**Time**: 4-5 hours

---

#### 4.2 Quiz Taker (Student)
**File**: `src/app/(main)/course/[courseId]/chapter/[chapterId]/quiz/[quizId]/page.tsx`

**What to build**:
- Display questions one at a time
- Radio buttons for answers
- Timer (if time limit set)
- Submit button
- Auto-grading on submit
- Results page

**Backend function to add**:
```typescript
submitQuizAttempt(userId, quizId, answers) → {score, passed}
```

**Time**: 3-4 hours

---

### Phase 5: Assignments (LOW PRIORITY)

#### 5.1 Assignment Creator
**File**: Similar structure to quiz

**Time**: 3-4 hours

#### 5.2 Assignment Submission
**Time**: 2-3 hours

#### 5.3 Grading Interface
**Time**: 3-4 hours

---

## 📊 Time Estimates

### Minimal Viable (Core Features Only)
- Course CRUD: 3 hours
- Chapter management: 4 hours
- Content upload: 3 hours
- Student viewer: 4 hours
- Progress tracking: 2 hours
**Total: ~16 hours (2-3 days)**

### Full MVP
- All above: 16 hours
- Quiz system: 8 hours
- Assignment system: 10 hours
**Total: ~34 hours (5-7 days)**

---

## 🛠️ Development Tips

### 1. Use Existing Components
Your project has great UI components in `src/components/ui/`:
```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
```

### 2. Form Pattern
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
});

function MyForm() {
    const form = useForm({
        resolver: zodResolver(schema),
    });
    
    const onSubmit = async (data) => {
        // Save to Firestore
    };
    
    return <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* fields */}
    </form>;
}
```

### 3. Loading States
```typescript
const [loading, setLoading] = useState(false);

async function handleAction() {
    setLoading(true);
    try {
        await doSomething();
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
}
```

### 4. Error Handling
```typescript
const [error, setError] = useState('');

try {
    await operation();
} catch (err) {
    setError('Something went wrong');
}

// In JSX:
{error && <div className="text-red-600">{error}</div>}
```

---

## 🎯 Your First Task (Start Now!)

**Goal**: Build the course edit page

**Steps**:
1. Create `src/app/(main)/teacher/courses/[courseId]/page.tsx`
2. Fetch course data using `getCourse(courseId)`
3. Create form with: title, description, price, categoryId
4. On submit: call `updateCourse(courseId, data)`
5. Add success/error messages
6. Test it!

**Expected time**: 2 hours

**Starter code**:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCourse, updateCourse } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function EditCoursePage() {
    const params = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function fetchCourse() {
            const data = await getCourse(params.courseId as string);
            setCourse(data);
            setLoading(false);
        }
        fetchCourse();
    }, [params.courseId]);
    
    if (loading) return <div>Loading...</div>;
    if (!course) return <div>Course not found</div>;
    
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Edit Course</h1>
            {/* Add form here */}
        </div>
    );
}
```

---

## ✅ Testing Checklist

After building each feature:

- [ ] Test as instructor
- [ ] Test as student
- [ ] Test error cases
- [ ] Test loading states
- [ ] Check mobile responsiveness
- [ ] Verify data saves to Firestore
- [ ] Check console for errors

---

## 📚 Key References

1. **Backend operations**: `src/lib/firestore.ts`
2. **Types**: `src/types/index.ts`
3. **Auth with roles**: `src/contexts/AuthContext.tsx`
4. **Existing course page**: `src/app/(main)/teacher/courses/page.tsx`

---

## 🆘 Get Unstuck

### Can't see instructor button?
- Check user role in Firestore
- Verify `isInstructor` in AuthContext
- Check console for errors

### Firestore permission denied?
- Check Firebase rules
- Verify user is authenticated
- Check user.uid matches

### Can't fetch data?
- Check Firestore collection names
- Verify document structure
- Look at console errors

---

## 🎉 You're Ready!

Everything you need is set up. The backend is complete, types are defined, authentication works, and you have working examples.

**Pick Phase 1, Task 1.1 above and start coding!** 

You'll have a working course edit page in 2 hours. 🚀

Good luck! 💪
