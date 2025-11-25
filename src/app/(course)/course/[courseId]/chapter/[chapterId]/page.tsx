

import { getChapterDetail } from "@/lib/firestore";

import { YoutubePlayer } from "@/components/course/YoutubePlayer";

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
    
    console.log(courseId, chapterId);
    console.log(chapterDetail);

    return (
        <div>
            <div className="flex flex-col max-w-6xl mx-auto pb-20">
                <div className="p-4 flex flex-col md:flex-row items-center justify-between">
                    <h2 className="text-2xl font-semibold mb-2">{chapterDetail.title}</h2>
                </div>

                <div className="p-4">
                    <YoutubePlayer videoUrl={chapterDetail.videoUrl} title={chapterDetail.title} />
                </div>

                <div>
                    <div className="p-4">
                        <p className="text-gray-700">{chapterDetail.content}</p>
                    </div>
                    <h2 className="text-xl font-semibold mt-2 py-1 px-4">
                        Course Attachments
                    </h2>
                    <div className="p-4">
                    </div>
                </div>
            </div>
        </div>
    );
}