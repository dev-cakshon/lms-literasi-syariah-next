import * as React from "react";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function CourseGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
