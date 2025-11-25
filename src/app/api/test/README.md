# Firestore Testing API Routes

Test endpoints untuk debug dan melihat response dari Firestore functions.

## 📋 Available Endpoints

### 1. Test All Functions (Comprehensive)
```bash
GET http://localhost:3000/api/test/firestore
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-01-20T10:30:00.000Z",
  "tests": {
    "getAllCourses": { "success": true, "count": 3, "data": [...] },
    "getSingleCourse": { "success": true, "data": {...} },
    "getCourseChapters": { "success": true, "count": 5, "data": [...] },
    "getUserProgress": { "success": true, "data": {...} }
  },
  "summary": {
    "totalTests": 4,
    "passed": 4,
    "failed": 0
  }
}
```

---

### 2. Get All Courses
```bash
GET http://localhost:3000/api/test/courses
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "course-1",
      "title": "Ekonomi Islam",
      "totalChapters": 5,
      "imageUrl": "/assets/images/course1.jpg"
    }
  ]
}
```

---

### 3. Get Single Course with Chapters
```bash
GET http://localhost:3000/api/test/course/course-1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "course-1",
      "title": "Ekonomi Islam",
      "totalChapters": 5
    },
    "chapters": [
      { "id": "ch-1", "title": "Pengenalan", "order": 1 },
      { "id": "ch-2", "title": "Dasar-dasar", "order": 2 }
    ],
    "chaptersCount": 2
  }
}
```

---

### 4. Get Single Chapter
```bash
GET http://localhost:3000/api/test/chapter?courseId=course-1&chapterId=ch-1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ch-1",
    "title": "Pengenalan Ekonomi Islam",
    "content": "...",
    "videoUrl": "https://...",
    "order": 1
  }
}
```

---

### 5. Get User Progress
```bash
GET http://localhost:3000/api/test/progress?userId=user-123&courseId=course-1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-123",
    "courseId": "course-1",
    "progressDetail": [
      { "chapterId": "ch-1", "isCompleted": true, "pointsAwarded": 10 },
      { "chapterId": "ch-2", "isCompleted": false, "pointsAwarded": 0 }
    ]
  },
  "completedCount": 1,
  "totalPoints": 10
}
```

---

## 🧪 Testing Guide

### Using Browser
1. Start dev server: `npm run dev`
2. Open: `http://localhost:3000/api/test/firestore`
3. Check JSON response

### Using cURL
```bash
# Test all
curl http://localhost:3000/api/test/firestore

# Test specific course
curl http://localhost:3000/api/test/course/course-1

# Test progress
curl "http://localhost:3000/api/test/progress?userId=user-123&courseId=course-1"
```

### Using Thunder Client / Postman
Import these URLs:
- GET `{{baseUrl}}/api/test/firestore`
- GET `{{baseUrl}}/api/test/courses`
- GET `{{baseUrl}}/api/test/course/:courseId`
- GET `{{baseUrl}}/api/test/chapter?courseId=xxx&chapterId=xxx`
- GET `{{baseUrl}}/api/test/progress?userId=xxx&courseId=xxx`

---

## 🐛 Debugging Tips

### If courses return empty:
1. Check Firebase Console → Firestore
2. Verify collection name is `courses` (not `course`)
3. Check Firestore rules allow read access

### If 404 errors:
1. Check `courseId` exactly matches Firestore document ID
2. Check collection path: `courses/{courseId}/chapters/{chapterId}`
3. Verify data exists in Firebase Console

### If permission denied:
Update Firestore Rules to:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true; // For testing only!
    }
  }
}
```

---

## ✅ Expected Results

If everything works:
- `/api/test/firestore` → All tests pass
- `/api/test/courses` → Returns array of courses
- `/api/test/course/[id]` → Returns course + chapters
- `/api/test/progress` → Returns user progress data

Happy testing! 🚀
