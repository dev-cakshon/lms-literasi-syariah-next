import { redirect } from "next/navigation";

import { getChaptersByCourse } from "@/lib/firestore";

export default async function CourseIdPage({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) {
    const { courseId } = await params;

    const chapters = await getChaptersByCourse(courseId);
    console.log("Chapters in CourseIdPage:", chapters);

    if (chapters.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No Chapter Found</p>
            </div>
        );
    }

    // Redirect to first chapter
    const firstChapter = chapters[0];
    redirect(`/course/${courseId}/chapter/${firstChapter.id}`);
}
