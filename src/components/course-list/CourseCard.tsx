"use client"

import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { CourseProgress } from "./CourseProgress";
import { IconBadge } from "./IconBadge";

interface CourseCardProps {
    _id: string;
    title: string;
    imageUrl: string | null;
    price: number;
    progress: number | null;
    category: string;
    chaptersLength: number;
}

export const CourseCard = ({
    _id,
    title,
    imageUrl,
    price,
    progress,
    category,
    chaptersLength,
}: CourseCardProps) => {
    return (
        <Link href={`/course/${_id}`}>
            <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full">
                {imageUrl ? (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden">
                        <Image fill className="object-cover" alt={title} src={imageUrl} />
                    </div>
                ) : null}
                <div className="flex flex-col pt-2">
                    <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transition line-clamp-2">
                        {title}
                    </div>
                    <span className="text-xs text-muted-foreground">{category}</span>
                    <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
                        <div className="flex items-center gap-x-1 text-slate-500">
                            <IconBadge icon={BookOpen} size="sm" />
                            <span>
                                {chaptersLength}
                                {chaptersLength === 1 ? " Bab" : " Bab"}
                            </span>
                        </div>
                    </div>
                    {progress !== null ? (
                        <CourseProgress size="sm" value={progress} variant={progress == 100 ? "success" : "default"} />
                    ) : (
                        <span className="text-md md:text-sm text-end font-medium text-emerald-700">
                            Rp {price.toLocaleString('id-ID')}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};
