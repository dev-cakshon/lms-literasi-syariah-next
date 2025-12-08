"use client";

import { CheckCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

import { subscribeToCourses, subscribeToUserProgress } from "@/lib/firestore";

import { CourseList } from "@/components/course-list/CourseList";
import { InfoCard } from "@/components/course-list/InfoCard";

import { useAuth } from "@/contexts/AuthContext";

interface DisplayCourse {
    id: string;
    title: string;
    imageUrl: string | null;
    progress: number;
    category: string;
    chaptersLength: number;
    createdAt?: string;
}

export default function MyCoursesPage() {
    const { user, loading: authLoading } = useAuth();
    const [courses, setCourses] = useState<DisplayCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        let userProgressData: Record<string, unknown>[] = [];
        let coursesData: Record<string, unknown>[] = [];

        const calculateCourses = () => {
            // Map: courseId -> number of chapters completed
            const completedChapterCounts: Record<string, number> = {};
            userProgressData.forEach((progress) => {
                const courseId = progress.courseId as string;
                if (courseId) {
                    completedChapterCounts[courseId] = (completedChapterCounts[courseId] || 0) + 1;
                }
            });

            // Calculate progress for each course
            const mapped: DisplayCourse[] = coursesData
                .map((course) => {
                    const completedChapters = completedChapterCounts[course.id as string] || 0;
                    const totalChapters = course.totalChapters as number || 0;
                    const progressPct = totalChapters > 0
                        ? Math.round((completedChapters / totalChapters) * 100)
                        : 0;

                    return {
                        id: course.id as string,
                        title: course.title as string || "Untitled Course",
                        imageUrl: course.imageUrl as string || null,
                        progress: progressPct,
                        category: course.categoryId as string || "",
                        chaptersLength: totalChapters,
                        createdAt: course.createdAt as string || undefined,
                    };
                })
                // sort courses based on createdAt (newest first)
                .sort((a, b) => {
                    const ad = a.createdAt ? Date.parse(a.createdAt) : 0;
                    const bd = b.createdAt ? Date.parse(b.createdAt) : 0;
                    return bd - ad;
                });

            setCourses(mapped);
            setLoading(false);
        };

        // Subscribe to user progress
        const unsubProgress = subscribeToUserProgress(user.uid, (progress) => {
            userProgressData = progress;
            if (coursesData.length > 0) {
                calculateCourses();
            }
        });

        // Subscribe to courses
        const unsubCourses = subscribeToCourses((courses) => {
            coursesData = courses;
            if (userProgressData.length > 0 || coursesData.length > 0) {
                calculateCourses();
            }
        });

        return () => {
            unsubProgress();
            unsubCourses();
        };
    }, [authLoading, user]);

    if (authLoading || loading) {
        return (
            <div className="p-6 bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Memuat...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
                <p className="text-sm text-muted-foreground">Silakan login untuk melihat kursus Anda.</p>
            </div>
        );
    }

    const completedCourses = courses.filter((c) => c.progress !== null && c.progress === 100);
    const courseInProgress = courses.filter((c) => c.progress !== null && c.progress < 100);

    return (
        <div className="p-6 space-y-4 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard icon={Clock} label="In Progress" numberOfItems={courseInProgress.length} />
                <InfoCard icon={CheckCircle} label="Completed" numberOfItems={completedCourses.length} variant="success" />
            </div>
            <CourseList items={[...completedCourses, ...courseInProgress]} />
        </div>
    );
}
