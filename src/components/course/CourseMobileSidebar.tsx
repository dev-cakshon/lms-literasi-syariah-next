// "use client"

import { Menu } from "lucide-react";

import { CourseSidebar } from "./CourseSidebar";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

interface CourseMobileSidebarProps {
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

export const CourseMobileSidebar = ({
    course,
    chapters,
}: CourseMobileSidebarProps) => {
    // const { userId } = auth();
    const userId = "user-123"; // Stub userId
    return (
        <Sheet>
            <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
                <Menu />
            </SheetTrigger>
            <SheetContent className="p-0 bg-white w-72" side="left">
                <CourseSidebar userId={userId} course={course} chapters={chapters} />
            </SheetContent>
        </Sheet>
    );
};
