import { redirect } from "next/navigation";

import { getCourseDataById } from "@/lib/dummyData";

const CourseIdPage = async ({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) => {
    const { courseId } = await params;

    console.log("=== CourseIdPage Debug ===");
    console.log("Requested courseId:", courseId);

    // Get course data by ID
    const courseData = getCourseDataById(courseId);

    console.log("Course data found:", courseData ? "YES" : "NO");
    if (courseData) {
        console.log("Course title:", courseData.course.title);
        console.log("Chapters count:", courseData.chapters.length);
        console.log("First chapter ID:", courseData.chapters[0]?._id);
    }

    if (!courseData || !courseData.chapters || courseData.chapters.length === 0) {
        console.log("REDIRECTING TO / - Reason:", !courseData ? "No course data" : "No chapters");
        return redirect("/");
    }

    const redirectUrl = `/course/${courseId}/chapter/${courseData.chapters[0]._id}`;
    console.log("REDIRECTING TO:", redirectUrl);
    console.log("=== End Debug ===");

    return redirect(redirectUrl);
};

export default CourseIdPage;
