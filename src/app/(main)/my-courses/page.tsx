import { CheckCircle, Clock } from "lucide-react";
import "@/lib/env";

import { getCourse, getUserEnrollments, getUserProgress } from "@/lib/firestore";

import { CourseList } from "@/components/course-list/CourseList";
import { InfoCard } from "@/components/InfoCard";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function MyCoursesPage() {
    const userId = "user-123"; // Stub user ID

    // Fetch user enrollments from Firestore
    const enrollments = await getUserEnrollments(userId);
    
    // Fetch course details and progress for each enrollment
    const coursesWithProgress = await Promise.all(
        enrollments.map(async (enrollment: any) => {
            const courseId = enrollment.courseId || enrollment.id;
            const course = await getCourse(courseId);
            if (!course) return null;

            const progress = await getUserProgress(userId, courseId);
            const completedChapters = progress?.chapters?.filter((ch: { isCompleted: boolean }) => ch.isCompleted).length || 0;
            const courseData = course as any;
            const totalChapters = courseData.totalChapters || 0;
            const progressPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

            return {
                _id: courseData.id,
                title: courseData.title,
                imageUrl: courseData.imageUrl || null,
                price: courseData.price || 0,
                progress: progressPercentage,
                category: courseData.categoryId || '',
                chaptersLength: totalChapters,
            };
        })
    );

    // Filter out null values and separate by completion status
    const validCourses = coursesWithProgress.filter((course): course is NonNullable<typeof course> => course !== null);
    const completedCourses = validCourses.filter(course => course.progress === 100);
    const courseInProgress = validCourses.filter(course => course.progress < 100);

    return (
        <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard
                    icon={Clock}
                    label="In Progress"
                    numberOfItems={courseInProgress.length}
                />
                <InfoCard
                    icon={CheckCircle}
                    label="Completed"
                    numberOfItems={completedCourses.length}
                    variant="success"
                />
            </div>
            <CourseList items={[...completedCourses, ...courseInProgress]} />
        </div>
    );
}
