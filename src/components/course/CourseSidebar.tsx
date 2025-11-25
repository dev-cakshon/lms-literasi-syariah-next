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
}

export const CourseSidebar = ({
    course,
    chapters,
    completedChapterIds,
}: CourseSidebarProps) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const completedChapters = chapters.filter((chapter) => completedChapterIds.has(chapter.id)).length;
    const progressCount = chapters.length > 0 ? (completedChapters / chapters.length) * 100 : 0;

    useEffect(() => {
        async function fetchQuizzes() {
            const fetchedQuizzes = await getQuizzesByCourse(course.id);
            setQuizzes(fetchedQuizzes.map((q) => ({
                id: q.id,
                title: (q as { title?: string }).title || "Quiz",
            })));
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
                {chapters.map((chapter) => (
                    <CourseSidebarItem
                        key={chapter.id}
                        id={chapter.id}
                        courseId={chapter.courseId}
                        label={chapter.title}
                        isCompleted={completedChapterIds.has(chapter.id)}
                        isLocked={false}
                        type="chapter"
                    />
                ))}
                {quizzes.map((quiz) => (
                    <CourseSidebarItem
                        key={quiz.id}
                        id={quiz.id}
                        courseId={course.id}
                        // label={quiz.title || "Quiz"}
                        label="Kuis"
                        isCompleted={false}
                        isLocked={progressCount < 100}
                        type="quiz"
                    />
                ))}
            </div>
        </div>
    );
};
