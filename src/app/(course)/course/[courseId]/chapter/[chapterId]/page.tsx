import { File } from "lucide-react";
import { redirect } from "next/navigation";

import { getChapter, getCourse, getCourseChapters } from "@/lib/firestore";

import { Separator } from "@/components/ui/separator";

// import { Banner } from "@/components/banner";
// import { Preview } from "@/components/preview";
// import { CourseEnrollButton } from "./_components/course-enroll-button";
// import { CourseProgressButton } from "./_components/course-progress-button";
// import { VideoPlayer } from "./_components/video-player";

const ChapterIdPage = async ({ params }: {
    params: Promise<{ courseId: string; chapterId: string }>;
}) => {
    const userId = "user-123"; // Stub userId

    if (!userId) {
        return redirect("/");
    }

    const { courseId, chapterId } = await params;

    // Fetch from Firestore
    const courseData = await getCourse(courseId);
    const chapterData = await getChapter(chapterId);
    const chaptersData = await getCourseChapters(courseId);
    
    if (!courseData || !chapterData) {
        return redirect("/");
    }

    // Transform data to match component expectations
    const course = {
        _id: courseData.id,
        title: courseData.title,
        price: courseData.price || 0,
        attachments: [],
    };

    const chapter = {
        _id: chapterData.id,
        title: chapterData.title,
        content: chapterData.content,
        videoUrl: chapterData.videoUrl,
        isFree: chapterData.isFree || false,
    };

    const chapters = chaptersData.map((ch: any) => ({
        _id: ch.id,
        title: ch.title,
    }));

    const purchased = true; // Assume purchased for now
    const isCompleted = false;
    const _muxData = (chapter.isFree || purchased) ? chapter.videoUrl : null;
    const attachments: string[] = [];
    const currentIndex = chapters.findIndex((ch) => ch._id === chapterId);
    const _nextChapter = currentIndex >= 0 && currentIndex < chapters.length - 1 
        ? chapters[currentIndex + 1] 
        : null;

    const _isLocked = !chapter.isFree && !purchased;
    const _completeOnEnd = !!purchased && isCompleted;

    return (
        <div>
            {/* {isCompleted && (
                <Banner variant="success" label="You already completed this chapter." />
            )}
            {isLocked && (
                <Banner
                    variant="warning"
                    label="You need to purchase this coruse to watch this chapter!"
                />
            )} */}
            <div className="flex flex-col max-w-6xl mx-auto pb-20">
                <div className="p-4">
                    {/* <VideoPlayer
                        chapterId={params.chapterId}
                        title={chapter.title}
                        courseId={params.courseId}
                        nextChapterId={nextChapter?._id!}
                        playbackId={muxData!}
                        isLocked={isLocked}
                        completeOnEnd={completeOnEnd}
                    /> */}
                    video player here
                </div>

                <div>
                    <div className="p-4 flex flex-col md:flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold mb-2">{chapter.title}</h2>
                        {/* {purchased ? ( */}
                        {/* <CourseProgressButton
                            chapterId={params.chapterId}
                            courseId={params.courseId}
                            nextChapterId={nextChapter?._id}
                            isCompleted={isCompleted}
                        /> */}
                        {/* ) : ( */}
                        {/* <CourseEnrollButton
                            courseId={params.courseId}
                            price={course.price}
                        /> */}
                        {/* )}  */}
                    </div>
                    <Separator />
                    <div className="p-4">
                        <p className="text-gray-700">{chapter.content}</p>
                        {/* <Preview value={chapter.content} /> */}
                    </div>
                    {/* {!!attachments.length && (
                        <> */}
                    <Separator />
                    <h2 className="text-xl font-semibold mt-2 py-1 px-4">
                        Course Attachments
                    </h2>
                    <div className="p-4">
                        {attachments.map((attachment, idx) => (
                            <a href={attachment} key={idx} target="_blank"
                                className="flex items-center p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline">
                                <File />
                                <p className="line-clamp-1">
                                    {attachment}
                                </p>
                            </a>
                        ))}
                    </div>
                    {/* </>
                    )} */}
                </div>
            </div>
        </div>
    );
};

export default ChapterIdPage;