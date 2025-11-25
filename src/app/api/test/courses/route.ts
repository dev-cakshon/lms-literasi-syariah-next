import { NextResponse } from "next/server";
import { getCourses } from "@/lib/firestore";

/**
 * Test endpoint for fetching all courses
 * GET /api/test/courses
 */
export async function GET() {
    try {
        const courses = await getCourses();
        
        return NextResponse.json({
            success: true,
            count: courses.length,
            data: courses,
            message: `Successfully fetched ${courses.length} courses`
        });
    } catch (error: any) {
        console.error("Error in /api/test/courses:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
