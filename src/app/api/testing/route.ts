import { NextResponse } from "next/server";

import { getQuizDetail } from "@/lib/firestore";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const courseId = searchParams.get("courseId");

        const result = await getQuizDetail("ekonomi_syariah_main", "fgbgLP1vvK1e1FpOys43");

        return NextResponse.json({
            success: true,
            data: result,
            message: `Successfully fetch`
        });
    } catch (error: any) {
        console.error("Error in ", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
