"use client";

import * as React from "react";

import { LandingCourseCard } from "./LandingCourseCard";
import ButtonLink from "../links/ButtonLink";

// Course data type
interface Course {
    title: string;
    illustration: React.ReactNode;
    duration: string;
    modules?: string;
    href: string;
}

export const CourseSection = () => {
    // Courses data array
    const courses: Course[] = [
        {
            title: 'Dasar-Dasar Fiqih Muamalah',
            illustration: (
                // <svg className='h-20 w-20 text-amber-500' viewBox='0 0 64 64' fill='currentColor'>
                //     <circle cx='32' cy='32' r='28' opacity='0.2' />
                //     <path d='M32 8L28 16L32 24L36 16z' />
                //     <rect x='28' y='24' width='8' height='16' />
                //     <circle cx='24' cy='36' r='4' />
                //     <circle cx='40' cy='36' r='4' />
                // </svg>
                'logo here'
            ),
            duration: '6 Bab • 30 Jam',
            modules: 'Pemula',
            href: '/course/1',
        },
        {
            title: 'Manajemen Keuangan Syariah',
            illustration: (
                // <svg className='h-20 w-20 text-primary-600' viewBox='0 0 64 64' fill='none' stroke='currentColor' strokeWidth='2'>
                //     <rect x='12' y='16' width='40' height='32' rx='2' />
                //     <path d='M16 24h32M16 32h32M16 40h32' strokeLinecap='round' />
                //     <circle cx='24' cy='28' r='2' fill='currentColor' />
                //     <circle cx='40' cy='28' r='2' fill='currentColor' />
                //     <path d='M28 36h8l-4 6z' fill='currentColor' />
                // </svg>
                'logo here'
            ),
            duration: '10 Bab • 45 Jam',
            modules: 'Menengah',
            href: '/course/3',
        },
        {
            title: 'Investasi Halal & Sukuk',
            illustration: (
                // <svg className='h-20 w-20 text-blue-500' viewBox='0 0 64 64' fill='currentColor'>
                //     <rect x='16' y='36' width='8' height='16' opacity='0.6' />
                //     <rect x='28' y='28' width='8' height='24' opacity='0.8' />
                //     <rect x='40' y='20' width='8' height='32' />
                //     <circle cx='32' cy='12' r='4' opacity='0.4' />
                // </svg>
                'logo here'
            ),
            duration: '8 Bab • 40 Jam',
            modules: 'Lanjutan',
            href: '/course/2',
        },
        {
            title: 'Akuntansi Lembaga Keuangan Syariah',
            illustration: (
                // <svg className='h-20 w-20 text-emerald-600' viewBox='0 0 64 64' fill='none' stroke='currentColor' strokeWidth='2'>
                //     <rect x='16' y='12' width='32' height='40' rx='2' />
                //     <path d='M20 20h24M20 28h24M20 36h16' strokeLinecap='round' />
                //     <circle cx='44' cy='44' r='8' fill='currentColor' opacity='0.2' />
                //     <path d='M44 40v8M40 44h8' strokeLinecap='round' />
                // </svg>
                'logo here'
            ),
            duration: '12 Bab • 50 Jam',
            modules: 'Lanjutan',
            href: '/course/4',
        },
    ];

    return (
        <section id='course' className='bg-white py-20'>
            <div className='layout'>
                {/* Section Header */}
                <div className='mb-12 text-center'>
                    <h2 className='mb-3 text-3xl font-bold text-dark md:text-4xl'>
                        Kursus Ekonomi Syariah Unggulan
                    </h2>
                    <p className='text-lg text-gray-600'>
                        Pelajari prinsip ekonomi Islam dari dasar hingga penerapan praktis di industri keuangan syariah
                    </p>
                </div>

                {/* Courses Grid */}
                <div className='grid gap-6 md:grid-cols-2 lg:gap-8'>
                    {courses.map((course, index) => (
                        <LandingCourseCard
                            key={index}
                            title={course.title}
                            illustration={course.illustration}
                            duration={course.duration}
                            modules={course.modules}
                            href={course.href}
                        />
                    ))}
                </div>

                {/* Bottom CTA - View All Courses */}
                <div className='mt-12 text-center'>
                    <ButtonLink href='/course'>
                        Lihat Semua Kursus
                    </ButtonLink>
                </div>
            </div>
        </section>
    );
}