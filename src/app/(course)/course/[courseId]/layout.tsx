"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
    getChaptersByCourse,
    getCourseDetail,
    getProgressByCourse,
} from "@/lib/firestore";

import { CourseNavbar } from "@/components/course/CourseNavbar";
import { CourseSidebar } from "@/components/course/CourseSidebar";

import { useAuth } from "@/contexts/AuthContext";

interface Course {
    id: string;
    title: string;
    price: number;
}

interface Chapter {
    id: string;
    courseId: string;
    title: string;
    content: string;
    videoUrl: string;
    order: number;
    isFree: boolean;
}

interface CourseLayoutClientProps {
    children: React.ReactNode;
    courseId: string;
}

function CourseLayoutClient({ children, courseId }: CourseLayoutClientProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [completedChapterIds, setCompletedChapterIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        async function fetchData() {
            if (!user) return;

            try {
                // Fetch course detail
                const courseData = await getCourseDetail(courseId);
                if (!courseData) {
                    router.push("/");
                    return;
                }

                type CourseData = { title?: string; price?: number };
                const data = courseData as CourseData;

                setCourse({
                    id: courseData.id,
                    title: data.title || "Untitled Course",
                    price: data.price || 0,
                });

                // Fetch chapters
                const chaptersData = await getChaptersByCourse(courseId);
                console.log("Chapters Data:", chaptersData);
                type ChapterData = {
                    id: string;
                    title?: string;
                    content?: string;
                    videoUrl?: string;
                    order?: number;
                    isFree?: boolean;
                };
                const formattedChapters: Chapter[] = chaptersData.map((doc: ChapterData & { id: string }) => {
                    const data = doc as ChapterData;
                    return {
                        id: doc.id,
                        courseId: courseId,
                        title: data.title || "Untitled Chapter",
                        content: data.content || "",
                        videoUrl: data.videoUrl || "",
                        order: data.order || 0,
                        isFree: data.isFree || false,
                    };
                });
                setChapters(formattedChapters);

                // Fetch progress
                const progressData = await getProgressByCourse(user.uid, courseId);
                console.log("Progress Data:", progressData);
                const completed = new Set<string>(
                    progressData.progressDetail
                        .filter((p) => p.isCompleted)
                        .map((p) => p.chapterId)
                );
                setCompletedChapterIds(completed);
            } catch (error) {
                // Error fetching course data
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user, courseId, router]);

    if (loading || !course) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Memuat kursus...</p>
            </div>
        );
    }

    return (
        <div className="h-full">
            <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
                <CourseNavbar
                    // course={course}
                    // chapters={chapters.map(ch => ({
                    //     ...ch,
                    //     isCompleted: completedChapterIds.has(ch._id)
                    // }))}
                />
            </div>

            <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
                <CourseSidebar
                    course={course}
                    chapters={chapters}
                    completedChapterIds={completedChapterIds}
                />
            </div>
            <main className="md:pl-80 h-full pt-[80px]">
                {children}
            </main>
        </div>
    );
}

interface CourseLayoutWrapperProps {
    children: React.ReactNode;
    params: Promise<{ courseId: string }>;
}

export default function CourseLayout({ children, params }: CourseLayoutWrapperProps) {
    const [courseId, setCourseId] = useState<string | null>(null);

    useEffect(() => {
        params.then(p => setCourseId(p.courseId));
    }, [params]);

    if (!courseId) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Memuat...</p>
            </div>
        );
    }

    return <CourseLayoutClient courseId={courseId}>{children}</CourseLayoutClient>;
}
