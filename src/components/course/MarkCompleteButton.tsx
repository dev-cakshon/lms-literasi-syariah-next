"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { markChapterComplete, getChapters } from "@/lib/api";
import { useCourseProgress } from "@/hooks/use-realtime";

import Button from "@/components/buttons/Button";

import { useAuth } from "@/contexts/AuthContext";

interface MarkCompleteButtonProps {
    courseId: string;
    chapterId: string;
}

export const MarkCompleteButton = ({ courseId, chapterId }: MarkCompleteButtonProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const { completedChapters } = useCourseProgress(courseId);
    const isCompleted = completedChapters.includes(chapterId);

    // Reset loading spinner when route changes (component persists in layout)
    useEffect(() => {
        setIsLoading(false);
    }, [pathname, courseId, chapterId]);

    const handleMarkComplete = async () => {
        if (!user) {
            alert("Please login to mark as complete");
            return;
        }

        setIsLoading(true);
        try {
            await markChapterComplete(courseId, chapterId);
            
            // Fetch chapters to find the next one
            const chapters = await getChapters(courseId);
            const sortedChapters = [...chapters].sort((a, b) => (a.order || 0) - (b.order || 0));
            
            const currentIndex = sortedChapters.findIndex(ch => ch.id === chapterId);
            
            if (currentIndex !== -1 && currentIndex < sortedChapters.length - 1) {
                const nextChapter = sortedChapters[currentIndex + 1];
                setIsLoading(false);
                router.push(`/course/${courseId}/chapter/${nextChapter.id}`);
            } else {
                setIsLoading(false);
                router.push(`/course/${courseId}`);
            }
        } catch (error) {
            console.error("Error marking as complete:", error);
            alert("Failed to mark as complete");
            setIsLoading(false);
        }
    };

    // Hide button if already completed
    if (isCompleted) return null;

    return (
        <Button onClick={handleMarkComplete} isLoading={isLoading}>
            Mark as Complete
        </Button>
    );
};
