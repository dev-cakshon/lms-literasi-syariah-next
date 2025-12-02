"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createProgress, getChaptersByCourse, getProgressByCourse } from "@/lib/firestore";

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
    const [isCompleted, setIsCompleted] = useState<boolean | null>(null);

    // Reset loading spinner when route changes (component persists in layout)
    useEffect(() => {
        setIsLoading(false);
    }, [pathname, courseId, chapterId]);

    // Hide button if chapter already completed
    useEffect(() => {
        let mounted = true;
        const check = async () => {
            if (!user) {
                // Unknown completion when not logged in; allow showing button (will prompt login)
                setIsCompleted(null);
                return;
            }
            try {
                const progress = await getProgressByCourse(user.uid, courseId);
                const done = progress.progressDetail.some(p => p.chapterId === chapterId && !!p.isCompleted);
                if (mounted) setIsCompleted(done);
            } catch {
                if (mounted) setIsCompleted(null);
            }
        };
        check();
        return () => { mounted = false; };
    }, [user, courseId, chapterId]);

    const handleMarkComplete = async () => {
        if (!user) {
            alert("Please login to mark as complete");
            return;
        }

        setIsLoading(true);
        try {
            await createProgress(user.uid, courseId, chapterId);
            
            // Fetch chapters to find the next one
            const chapters = await getChaptersByCourse(courseId);
            const sortedChapters = chapters.sort((a, b) => 
                ((a as { order?: number }).order || 0) - ((b as { order?: number }).order || 0)
            );
            
            const currentIndex = sortedChapters.findIndex(ch => ch.id === chapterId);
            
            if (currentIndex !== -1 && currentIndex < sortedChapters.length - 1) {
                // Navigate to next chapter
                const nextChapter = sortedChapters[currentIndex + 1];
                setIsLoading(false);
                router.push(`/course/${courseId}/chapter/${nextChapter.id}`);
            } else {
                // Last chapter - go back to course page
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
    if (isCompleted === true) return null;

    return (
        <Button onClick={handleMarkComplete} isLoading={isLoading}>
            Mark as Complete
        </Button>
    );
};
