import { NextResponse } from "next/server";
import { getUserProgress } from "@/lib/firestore";

/**
 * Test endpoint for fetching user progress
 * GET /api/test/progress?userId=xxx&courseId=xxx
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const courseId = searchParams.get("courseId");
        
        if (!userId || !courseId) {
            return NextResponse.json({
                success: false,
                message: "Missing required params: userId and courseId",
                example: "/api/test/progress?userId=user-123&courseId=course-1"
            }, { status: 400 });
        }
        
        const progress = await getUserProgress(userId, courseId);
        
        return NextResponse.json({
            success: true,
            data: progress,
            completedCount: progress.progressDetail.filter(ch => ch.isCompleted).length,
            totalPoints: progress.progressDetail.reduce((sum, ch) => sum + ch.pointsAwarded, 0),
            message: `Successfully fetched progress for user ${userId} in course ${courseId}`
        });
    } catch (error: any) {
        console.error("Error in /api/test/progress:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
