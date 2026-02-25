"use client";

import * as React from "react";

import { FeatureCard } from "./FeatureCard";

// Feature data type - using the same interface from FeatureCard
interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export const FeatureSection = () => {
    // Feature data array - easy to manage and update
    const features: Feature[] = [
        {
            icon: (
                // <svg className='h-12 w-12 text-primary-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                //     <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                //     <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6M9 16h6' />
                // </svg>
                null
            ),
            title: 'Pakar Ekonomi Syariah Berpengalaman',
            description: 'Belajar langsung dari praktisi dan akademisi yang ahli di bidang ekonomi dan keuangan syariah dengan pengalaman puluhan tahun.',
        },
        {
            icon: (
                // <svg className='h-12 w-12 text-primary-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                //     <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
                // </svg>
                null
            ),
            title: 'Materi Komprehensif Berbasis Syariah',
            description: 'Kurikulum lengkap dari dasar fiqih muamalah hingga aplikasi praktis dalam perbankan, investasi, dan manajemen keuangan syariah modern.',
        },
        {
            icon: (
                // <svg className='h-12 w-12 text-primary-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                //     <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' />
                // </svg>
                null
            ),
            title: 'Sertifikat Profesional Terakreditasi',
            description: 'Dapatkan sertifikat yang diakui industri untuk meningkatkan kredibilitas profesional Anda di bidang keuangan dan ekonomi syariah.',
        },
        {
            icon: (
                // <svg className='h-12 w-12 text-primary-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                //     <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                //     <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 11l2 2 4-4' />
                // </svg>
                null
            ),
            title: 'Pembelajaran Fleksibel & Interaktif',
            description: 'Akses materi kapan saja, di mana saja dengan video berkualitas HD, studi kasus nyata, dan forum diskusi dengan sesama praktisi syariah.',
        },
    ];

    return (
        <section id='feature' className='bg-gray-50 py-20'>
            <div className='layout'>
                {/* Section Title */}
                <h2 className='mb-12 text-center text-3xl font-bold text-dark md:text-4xl'>
                    Mengapa Memilih Platform Kami?
                </h2>

                {/* Features Grid */}
                <div className='grid gap-6 md:grid-cols-2 lg:gap-8'>
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}