"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getChapters, getQuizzes } from "@/lib/api";

export default function CourseIdPage({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) {
    const router = useRouter();
    const [courseId, setCourseId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        params.then((p) => setCourseId(p.courseId));
    }, [params]);

    useEffect(() => {
        if (!courseId) return;

        async function loadAndRedirect() {
            try {
                const [chapters, quizzes] = await Promise.all([
                    getChapters(courseId!),
                    getQuizzes(courseId!),
                ]);

                // Check for a pre-test quiz
                const preTest = quizzes.find((q) => q.type === "preTest");
                if (preTest) {
                    router.replace(`/course/${courseId}/quiz/${preTest.id}`);
                    return;
                }

                if (chapters.length === 0) {
                    setError("No Chapter Found");
                    setLoading(false);
                    return;
                }

                // Sort by order and redirect to first chapter
                const sorted = [...chapters].sort((a, b) => a.order - b.order);
                router.replace(`/course/${courseId}/chapter/${sorted[0].id}`);
            } catch (err) {
                console.error("Failed to load course:", err);
                setError("Gagal memuat kursus");
                setLoading(false);
            }
        }

        loadAndRedirect();
    }, [courseId, router]);

    if (error) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">{error}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Memuat kursus...</p>
            </div>
        );
    }

    return null;
}
