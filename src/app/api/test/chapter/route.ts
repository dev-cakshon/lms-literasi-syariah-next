import { NextResponse } from "next/server";
import { getChapter } from "@/lib/firestore";

/**
 * Test endpoint for fetching single chapter
 * GET /api/test/chapter?courseId=xxx&chapterId=xxx
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");
        const chapterId = searchParams.get("chapterId");
        
        if (!courseId || !chapterId) {
            return NextResponse.json({
                success: false,
                message: "Missing required params: courseId and chapterId",
                example: "/api/test/chapter?courseId=course-1&chapterId=ch-1"
            }, { status: 400 });
        }
        
        const chapter = await getChapter(courseId, chapterId);
        
        if (!chapter) {
            return NextResponse.json({
                success: false,
                message: `Chapter not found: ${chapterId} in course ${courseId}`,
                searchedParams: { courseId, chapterId }
            }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            data: chapter,
            message: `Successfully fetched chapter ${chapterId}`
        });
    } catch (error: any) {
        console.error("Error in /api/test/chapter:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
