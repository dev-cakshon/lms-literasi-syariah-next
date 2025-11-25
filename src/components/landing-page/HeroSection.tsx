'use client';

import * as React from 'react';

import ButtonLink from '../links/ButtonLink';

export const HeroSection = () => {
    return (
        <section className='relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500'>
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
                            href='#course'
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
            </div>
        </section>
    );
}