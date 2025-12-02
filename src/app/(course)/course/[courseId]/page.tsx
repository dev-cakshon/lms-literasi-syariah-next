import { redirect } from "next/navigation";

import { getChaptersByCourse, getQuizzesByCourse } from "@/lib/firestore";

export default async function CourseIdPage({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) {
    const { courseId } = await params;

    const chapters = await getChaptersByCourse(courseId);
    const quizzes = await getQuizzesByCourse(courseId);
    
    // Check if there's a pre-test quiz
    const preTest = quizzes.find((q) => (q as { type?: string }).type === "preTest");
    
    if (preTest) {
        // Redirect to pre-test if it exists
        redirect(`/course/${courseId}/quiz/${preTest.id}`);
    }

    if (chapters.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No Chapter Found</p>
            </div>
        );
    }

    // Redirect to first chapter if no pre-test
    const firstChapter = chapters[0];
    redirect(`/course/${courseId}/chapter/${firstChapter.id}`);
}
