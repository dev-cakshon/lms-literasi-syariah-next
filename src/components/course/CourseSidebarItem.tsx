"use client"

import { CheckCircle, Lock, PlayCircle } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"

interface CourseSidebarItemProps {
    id: string;
    label: string;
    isCompleted: boolean;
    isLocked?: boolean;
    courseId: string;
    type?: "chapter" | "quiz";
}

export const CourseSidebarItem = ({ id, label, isCompleted, isLocked = false, courseId, type = "chapter" }: CourseSidebarItemProps) => {

    const pathname = usePathname()
    const router = useRouter()
    const Icon = isLocked ? Lock : (isCompleted ? CheckCircle : PlayCircle)

    const isActive = pathname?.includes(id)

    const onClick = () => {
        if (isLocked) return;
        if (type === "quiz") {
            router.push(`/course/${courseId}/quiz/${id}`);
        } else {
            router.push(`/course/${courseId}/chapter/${id}`);
        }
    }
    return (
        <button
            onClick={onClick}
            disabled={isLocked}
            className={cn("flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
                isActive && "text-slate-700 bg-slate-200/20 hover:text-slate-700",
                isCompleted && "text-emerald-700 hover:text-emerald-700",
                isCompleted && isActive && "bg-emerald-200/20",
                isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-slate-500")}>
            {/* ICON */}
            <div className="flex items-center gap-x-2 py-4">
                <Icon size={22} className={cn("text-slate-500",
                    isActive && "text-slate-700",
                    isCompleted && "text-emerald-700")} />
                {label}
            </div>
            {/* VERTICAL BOOKMARK */}
            <div className={cn("ml-auto opacity-0 border-2 border-slate-700 h-full transition-all",
                isActive && "opacity-100",
                isCompleted && "border-emerald-700")} />
        </button>
    )
}