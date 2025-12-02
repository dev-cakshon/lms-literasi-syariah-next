"use client";

import { useEffect, useState } from "react";

import { getQuizzesByCourse } from "@/lib/firestore";

import { CourseSidebarItem } from "./CourseSidebarItem";
import { CourseProgress } from "../course-list/CourseProgress";

interface CourseSidebarProps {
    course: {
        id: string;
        title: string;
        price?: number;
    };
    chapters: {
        id: string;
        courseId: string;
        title: string;
        order: number;
    }[];
    completedChapterIds: Set<string>;
}

interface Quiz {
    id: string;
    title?: string;
    type?: string;
}

export const CourseSidebar = ({
    course,
    chapters,
    completedChapterIds,
}: CourseSidebarProps) => {
    const [preTest, setPreTest] = useState<Quiz[]>([]);
    const [postTest, setPostTest] = useState<Quiz[]>([]);
    const [preTestCompleted, setPreTestCompleted] = useState(false);

    const completedChapters = chapters.filter((chapter) => completedChapterIds.has(chapter.id)).length;
    const progressCount = chapters.length > 0 ? (completedChapters / chapters.length) * 100 : 0;

    useEffect(() => {
        async function fetchQuizzes() {
            const fetchedQuizzes = await getQuizzesByCourse(course.id);

            const preTestQuizzes = fetchedQuizzes.filter((q) =>
                (q as { type?: string }).type === "preTest"
            ).map((q) => ({
                id: q.id,
                title: (q as { title?: string }).title || "Pre-Test",
                type: "preTest",
            }));

            const postTestQuizzes = fetchedQuizzes.filter((q) =>
                (q as { type?: string }).type === "postTest"
            ).map((q) => ({
                id: q.id,
                title: (q as { title?: string }).title || "Post-Test",
                type: "postTest",
            }));

            setPreTest(preTestQuizzes);
            setPostTest(postTestQuizzes);

            // TODO: Fetch actual completion status from progress
            // For now, assume pre-test is completed if it exists
            setPreTestCompleted(preTestQuizzes.length === 0);
        }
        fetchQuizzes();
    }, [course.id]);

    return (
        <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
            <div className="p-8 flex flex-col border-b">
                <h1 className="font-semibold">{course.title}</h1>
                <div className="mt-10">
                    <CourseProgress
                        variant="success"
                        value={progressCount}
                    />
                </div>
            </div>
            <div className="flex flex-col w-full">
                {preTest.map((quiz) => (
                    <CourseSidebarItem
                        key={quiz.id}
                        id={quiz.id}
                        courseId={course.id}
                        label={quiz.title || "Pre-Test"}
                        isCompleted={false}
                        isLocked={false}
                        type="quiz"
                    />
                ))}
                {chapters.map((chapter) => (
                    <CourseSidebarItem
                        key={chapter.id}
                        id={chapter.id}
                        courseId={chapter.courseId}
                        label={chapter.title}
                        isCompleted={completedChapterIds.has(chapter.id)}
                        isLocked={!preTestCompleted}
                        type="chapter"
                    />
                ))}
                {postTest.map((quiz) => (
                    <CourseSidebarItem
                        key={quiz.id}
                        id={quiz.id}
                        courseId={course.id}
                        label={quiz.title || "Post-Test"}
                        isCompleted={false}
                        isLocked={progressCount < 100}
                        type="quiz"
                    />
                ))}
            </div>
        </div>
    );
};
