import { NextResponse } from "next/server";
import { getCourse, getCourseChapters } from "@/lib/firestore";

/**
 * Test endpoint for fetching single course with chapters
 * GET /api/test/course/[courseId]
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { courseId } = await params;
        
        const [course, chapters] = await Promise.all([
            getCourse(courseId),
            getCourseChapters(courseId)
        ]);
        
        if (!course) {
            return NextResponse.json({
                success: false,
                message: `Course not found: ${courseId}`,
                searchedId: courseId
            }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            data: {
                course,
                chapters,
                chaptersCount: chapters.length
            },
            message: `Successfully fetched course ${courseId} with ${chapters.length} chapters`
        });
    } catch (error: any) {
        console.error(`Error in /api/test/course/${(await params).courseId}:`, error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
