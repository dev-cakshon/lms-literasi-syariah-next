// "use client";

import { CourseMobileSidebar } from "./CourseMobileSidebar";
import { CourseNavbarRoutes } from "./CourseNavbarRoutes";

interface CourseNavbarProps {
    course: {
        title: string;
        purchased: { [key: string]: boolean };
    };
    chapters: {
        _id: string;
        courseId: string;
        title: string;
        isCompleted: { [key: string]: boolean };
        isFree: boolean;
    }[];
}

export const CourseNavbar = ({ course, chapters }: CourseNavbarProps) => {
    return (
        <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
            <CourseMobileSidebar
                course={course}
                chapters={chapters}
            />
            <CourseNavbarRoutes />
        </div>
    );
};
