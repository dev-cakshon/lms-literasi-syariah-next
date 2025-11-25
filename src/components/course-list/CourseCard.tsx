"use client"

import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { CourseProgress } from "./CourseProgress";
import { IconBadge } from "../IconBadge";

interface CourseCardProps {
    id: string;
    title: string;
    imageUrl: string | null;
    progress: number;
    category?: string;
    chaptersLength: number;
}

export const CourseCard = ({
    id,
    title,
    imageUrl,
    progress,
    chaptersLength,
}: CourseCardProps) => {
    // Normalize image URL: add leading slash for relative paths
    const normalizedImageUrl = imageUrl
        ? imageUrl.startsWith('http') || imageUrl.startsWith('/')
            ? imageUrl
            : `/${imageUrl}`
        : null;

    return (
        <Link href={`/course/${id}`}>
            <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full">
                {normalizedImageUrl ? (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden bg-slate-200">
                        <Image
                            fill
                            className="object-cover"
                            alt={title}
                            src={normalizedImageUrl}
                            onError={(e) => {
                                // Fallback to placeholder on error
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                    </div>
                ) : (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden bg-slate-200 flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-slate-400" />
                    </div>
                )}
                <div className="flex flex-col pt-2">
                    <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transition line-clamp-2">
                        {title}
                    </div>
                    <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
                        <div className="flex items-center gap-x-1 text-slate-500">
                            <IconBadge icon={BookOpen} size="sm" />
                            <span>
                                {chaptersLength}
                                {chaptersLength === 1 ? " Bab" : " Bab"}
                            </span>
                        </div>
                    </div>
                    <CourseProgress size="sm" value={progress} variant={progress == 100 ? "success" : "default"} />
                </div>
            </div>
        </Link>
    );
};
