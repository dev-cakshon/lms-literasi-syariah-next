import { redirect } from "next/navigation";
import * as React from "react";

import { getCourseDataById } from "@/lib/dummyData";

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

    console.log("=== CourseLayout Debug ===");
    console.log("CourseLayout courseId:", courseId);

    // Get course data by ID
    const courseData = getCourseDataById(courseId);
    
    console.log("CourseLayout - Course data found:", courseData ? "YES" : "NO");
    
    if (!courseData) {
        console.log("CourseLayout - REDIRECTING TO / (no course data)");
        return redirect("/");
    }

    const { course, chapters } = courseData;

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
