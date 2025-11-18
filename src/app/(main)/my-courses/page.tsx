"use client";

import { CheckCircle, Clock } from "lucide-react";
import "@/lib/env";

import { dummyDashboardData } from "@/lib/dummyData";

import { CourseList } from "@/components/course-list/CourseList";
import { InfoCard } from "@/components/InfoCard";

export default function MyCoursesPage() {

    // const { completedCourses, courseInProgress } = await GetDashboardCourses(
    //     userId
    // );
    const { completedCourses, courseInProgress } = dummyDashboardData;

    return (
        <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard
                    icon={Clock}
                    label="In Progress"
                    numberOfItems={courseInProgress.length}
                />
                <InfoCard
                    icon={CheckCircle}
                    label="Completed"
                    numberOfItems={completedCourses.length}
                    variant="success"
                />
            </div>
            <CourseList items={[...completedCourses, ...courseInProgress]} />
        </div>
    );
}
