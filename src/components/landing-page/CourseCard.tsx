import * as React from "react";
import ButtonLink from "@/components/links/ButtonLink";
import Button from "../buttons/Button";

// Props interface for CourseCard
export interface CourseCardProps {
    title: string;
    illustration: React.ReactNode; // Can be image or SVG
    duration: string; // e.g., "30 Jam Konten"
    modules?: string; // Optional, e.g., "Modul 4"
    href: string; // Link to course page
}

export const CourseCard = ({
    title,
    illustration,
    duration,
    modules,
    href,
}: CourseCardProps) => {
    return (
        <div className='group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl'>
            {/* Top Section - Title & Illustration */}
            <div className='flex items-center justify-between gap-4 p-6 pb-4'>
                {/* Title */}
                <h3 className='flex-1 text-xl font-bold text-dark leading-tight'>
                    {title}
                </h3>

                {/* Illustration */}
                <div className='flex-shrink-0 transition-transform duration-300 group-hover:scale-110'>
                    {illustration}
                </div>
            </div>

            {/* Middle Section - Course Info */}
            <div className='flex-1 space-y-2 px-6'>
                <div className='flex items-center gap-2 text-gray-600'>
                    <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    <span className='text-sm'>{duration}</span>
                </div>

                {modules && (
                    <div className='flex items-center gap-2 text-gray-600'>
                        <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                        <span className='text-sm'>{modules}</span>
                    </div>
                )}
            </div>

            {/* Bottom Section - CTA Button */}
            <div className='p-6 pt-4'>
                <ButtonLink href={href} >
                    Lihat Kursus
                </ButtonLink>
            </div>
        </div>
    );
}