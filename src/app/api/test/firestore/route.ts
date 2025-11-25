import { NextResponse } from "next/server";
import { getCourses, getCourse, getCourseChapters, getUserProgress } from "@/lib/firestore";

/**
 * Comprehensive test endpoint for all Firestore functions
 * GET /api/test/firestore
 */
export async function GET() {
    const results: any = {
        timestamp: new Date().toISOString(),
        tests: {}
    };
    
    try {
        // Test 1: Get all courses
        console.log("🧪 Testing getCourses()...");
        const courses = await getCourses();
        results.tests.getAllCourses = {
            success: true,
            count: courses.length,
            data: courses,
            message: `Found ${courses.length} courses`
        };
        
        // Test 2: Get single course (if courses exist)
        if (courses.length > 0) {
            const firstCourseId = courses[0].id;
            console.log(`🧪 Testing getCourse(${firstCourseId})...`);
            
            const course = await getCourse(firstCourseId);
            results.tests.getSingleCourse = {
                success: !!course,
                data: course,
                message: course ? `Found course: ${firstCourseId}` : `Course not found: ${firstCourseId}`
            };
            
            // Test 3: Get chapters for first course
            console.log(`🧪 Testing getCourseChapters(${firstCourseId})...`);
            const chapters = await getCourseChapters(firstCourseId);
            results.tests.getCourseChapters = {
                success: true,
                count: chapters.length,
                data: chapters,
                message: `Found ${chapters.length} chapters in course ${firstCourseId}`
            };
        } else {
            results.tests.getSingleCourse = {
                success: false,
                message: "No courses available to test"
            };
            results.tests.getCourseChapters = {
                success: false,
                message: "No courses available to test"
            };
        }
        
        // Test 4: Get user progress (with mock user)
        const mockUserId = "user-123";
        const mockCourseId = courses.length > 0 ? courses[0].id : "course-1";
        console.log(`🧪 Testing getUserProgress(${mockUserId}, ${mockCourseId})...`);
        
        const progress = await getUserProgress(mockUserId, mockCourseId);
        results.tests.getUserProgress = {
            success: true,
            data: progress,
            completedCount: progress.progressDetail.filter(ch => ch.isCompleted).length,
            message: `Found ${progress.progressDetail.length} progress records`
        };
        
        // Summary
        results.summary = {
            totalTests: Object.keys(results.tests).length,
            passed: Object.values(results.tests).filter((t: any) => t.success).length,
            failed: Object.values(results.tests).filter((t: any) => !t.success).length
        };
        
        return NextResponse.json({
            success: true,
            ...results
        });
        
    } catch (error: any) {
        console.error("❌ Error in comprehensive test:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
            partialResults: results
        }, { status: 500 });
    }
}
