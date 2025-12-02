import { getChapterDetail } from "@/lib/firestore";

import { ChapterContent } from "@/components/course/ChapterContent";

interface ChapterDetail {
    id: string;
    title: string;
    content: string;
    videoUrl: string;
    order: number;
    isFree: boolean;
}

export default async function ChapterIdPage({
    params
}: {
    params: Promise<{ courseId: string; chapterId: string }>;
}) {
    const { courseId, chapterId } = await params;

    // Fetch chapters details
    const chapterDetail = await getChapterDetail(courseId, chapterId) as ChapterDetail | null;
    
    if (!chapterDetail) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl text-red-500">Chapter not found</p>
            </div>
        );
    }

    return (
        <div>
            <ChapterContent
                courseId={courseId}
                chapterId={chapterId}
                title={chapterDetail.title}
                videoUrl={chapterDetail.videoUrl}
                content={chapterDetail.content}
            />
        </div>
    );
}