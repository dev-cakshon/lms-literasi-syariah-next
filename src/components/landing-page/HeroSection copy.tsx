'use client';

import * as React from 'react';

import ButtonLink from '@/components/links/ButtonLink';

export default function HeroSection() {
    return (
        <section className='relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500'>
            {/* Background Decorative Elements */}
            <div className='absolute inset-0 opacity-20'>
                {/* Mosque Silhouette Left */}
                <div className='absolute left-0 top-20 h-96 w-96 bg-emerald-900 opacity-30' style={{
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                }}></div>

                {/* Mosque Silhouette Right */}
                <div className='absolute right-0 top-32 h-80 w-80 bg-emerald-900 opacity-30' style={{
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                }}></div>

                {/* Decorative Dots Pattern */}
                <div className='absolute left-10 top-1/3 grid grid-cols-3 gap-2'>
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className='h-2 w-2 rounded-full bg-white opacity-40'></div>
                    ))}
                </div>
            </div>

            {/* Main Content Container */}
            <div className='layout relative grid min-h-screen items-center gap-8 py-20 pt-32 lg:grid-cols-2'>

                {/* Left Side - Text Content */}
                <div className='z-10 space-y-6'>
                    <h1 className='text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl'>
                        Kuasai Ilmu Ekonomi Syariah:
                        <br />
                        Dari Dasar hingga Ahli
                    </h1>

                    <p className='text-lg text-emerald-50 md:text-xl'>
                        Platform Pembelajaran Terkemuka untuk Keuangan Syariah dan Investasi Halal.
                    </p>

                    {/* CTA Button with Stats */}
                    <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
                        <ButtonLink
                            href='#kursus'
                            variant='light'
                            className='bg-gradient-to-r from-emerald-400 to-teal-500 px-8 py-3 text-white hover:from-emerald-500 hover:to-teal-600'
                        >
                            Mulai Belajar Sekarang
                        </ButtonLink>

                        {/* Stats Badge */}
                        <div className='flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white'>
                                <svg className='h-5 w-5 text-emerald-600' fill='currentColor' viewBox='0 0 20 20'>
                                    <path d='M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z' />
                                </svg>
                            </div>
                            <div className='text-white'>
                                <div className='text-sm font-semibold'>10,000+</div>
                                <div className='text-xs opacity-90'>Pelajar Aktif</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Illustration Area */}
                <div className='relative z-10 hidden lg:block'>
                    {/* Placeholder for Scale Illustration */}
                    <div className='relative mx-auto h-96 w-96'>
                        {/* Scale Balance - You'll replace this with actual image */}
                        <div className='flex h-full items-center justify-center'>
                            <div className='text-center'>
                                <svg className='mx-auto h-64 w-64 text-amber-400 opacity-80' fill='currentColor' viewBox='0 0 24 24'>
                                    <path d='M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z' />
                                </svg>
                                <p className='mt-4 text-white opacity-60'>
                                    [Your scale illustration here]
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Gold Sparkles */}
                    <div className='absolute right-10 top-10 h-4 w-4 animate-pulse rounded-full bg-amber-400'></div>
                    <div className='absolute right-20 top-32 h-3 w-3 animate-pulse rounded-full bg-amber-300' style={{ animationDelay: '0.5s' }}></div>
                    <div className='absolute right-32 top-20 h-2 w-2 animate-pulse rounded-full bg-amber-400' style={{ animationDelay: '1s' }}></div>
                </div>
            </div>

            {/* Bottom People Image Section */}
            <div className='absolute bottom-0 left-0 right-0 z-20 h-64 bg-gradient-to-t from-black/40 to-transparent'>
                {/* Placeholder for people image - You'll replace with actual image */}
                <div className='layout flex h-full items-end justify-center pb-8'>
                    <div className='flex gap-4 opacity-70'>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className='h-32 w-24 rounded-lg bg-white/10 backdrop-blur-sm'></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Decorative Pattern Bottom Right */}
            <div className='absolute bottom-10 right-10 grid grid-cols-3 gap-2 opacity-20'>
                {[...Array(9)].map((_, i) => (
                    <div key={i} className='h-2 w-2 rounded-full bg-white'></div>
                ))}
            </div>
        </section>
    );
}