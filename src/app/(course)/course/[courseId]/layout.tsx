import { redirect } from "next/navigation";
import * as React from "react";

import { getCourse, getCourseChapters } from "@/lib/firestore";

import { CourseNavbar } from "@/components/course/CourseNavbar";
import { CourseSidebar } from "@/components/course/CourseSidebar";

export default async function CourseLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ courseId: string }>;
}) {
    const { courseId } = await params;
    const userId = "user-123"; // Stub userId

    // Fetch course and chapters from Firestore
    const courseData = await getCourse(courseId);
    
    if (!courseData) {
        return redirect("/");
    }

    const chaptersData = await getCourseChapters(courseId);

    // Transform to match component expectations
    const course = {
        _id: courseData.id,
        title: courseData.title,
        price: courseData.price || 0,
        attachments: [],
        purchased: { [userId]: true },
    };

    const chapters = chaptersData.map((ch: any) => ({
        _id: ch.id,
        courseId: ch.courseId,
        title: ch.title,
        description: ch.content,
        content: ch.content,
        playbackId: ch.videoUrl,
        videoUrl: ch.videoUrl,
        isCompleted: { [userId]: false },
        isFree: ch.isFree || false,
    }));

    return (
        <div className="h-full">
            <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
                <CourseNavbar
                    course={course}
                    chapters={chapters}
                // progressCount={progressCount}
                />
            </div>

            <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
                <CourseSidebar
                    userId={userId}
                    course={course}
                    chapters={chapters}
                // progress={progressCount}
                />
            </div>
            <main className="md:pl-80 h-full pt-[80px]">
                {children}
            </main>
        </div>
    );
}
