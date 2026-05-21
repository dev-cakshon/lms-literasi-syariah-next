'use client';

import * as React from 'react';

export const HeroSection = () => {
  return (
    <section className='relative bg-linear-to-br from-primary-700 to-primary-500 overflow-hidden pt-20 pb-32'>
      {/* Background blobs */}
      <div className='absolute top-0 right-0 w-96 h-96 bg-accent-lime/10 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute bottom-0 left-0 w-80 h-80 bg-tertiary-fixed-dim/10 rounded-full blur-3xl pointer-events-none' />

      <div className='layout relative z-10'>
        <div className='grid lg:grid-cols-2 gap-16 items-center'>
          {/* Left column */}
          <div className='space-y-8'>
            <h1 className='font-display text-4xl lg:text-5xl font-bold tracking-[-0.02em] leading-[1.15] text-white'>
              Belajar Ekonomi Syariah, <br className='hidden lg:block' />
              <span className='text-accent-lime'>Sambil Bermain</span>
            </h1>

            <p className='text-lg text-tertiary-fixed-dim'>
              Platform pembelajaran syariah pertama dengan sistem gamifikasi.
              Kumpulkan XP, raih badge, dan kuasai ilmu ekonomi Islam dengan
              cara yang menyenangkan.
            </p>

            {/* CTAs */}
            <div className='flex flex-col sm:flex-row gap-4'>
              <a
                href='/signup'
                className='bg-accent-lime text-accent-lime-ink rounded-full px-8 py-4 font-bold tracking-wide text-center shadow-[0_4px_0_0_var(--color-accent-lime-dim)] hover:shadow-[0_2px_0_0_var(--color-accent-lime-dim)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150'
              >
                Mulai Belajar Sekarang
              </a>
              <a
                href='#course'
                className='border-2 border-primary-fixed text-primary-fixed rounded-full px-8 py-4 font-bold text-center hover:bg-white/10 transition-colors duration-150'
              >
                Jelajahi Kursus
              </a>
            </div>

            {/* Trust note */}
            <div className='flex items-center gap-2 text-primary-fixed/80 text-sm'>
              <span className='material-symbols-outlined text-base'>
                verified_user
              </span>
              <span>Disusun mengikuti kurikulum literasi ekonomi syariah</span>
            </div>
          </div>

          {/* Right column — Gamification Glass Card */}
          <div className='hidden lg:block perspective-[1000px]'>
            <div className='bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] shadow-2xl transform-3d rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-500 relative'>
              {/* Floating decals */}
              <div className='absolute -top-4 -right-4 z-20'>
                <div className='bg-accent-lime text-accent-lime-ink rounded-full px-3 py-1 text-sm font-bold flex items-center gap-1 animate-bounce shadow-lg'>
                  <span className='material-symbols-outlined text-base'>
                    emoji_events
                  </span>
                </div>
              </div>
              <div className='absolute -left-4 top-1/2 z-20 -rotate-12'>
                <div className='bg-white text-accent-lime-ink rounded-full px-3 py-1 text-xs font-bold shadow-lg'>
                  +10 XP
                </div>
              </div>

              {/* Header row */}
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-1 text-white'>
                  <span
                    className='material-symbols-outlined text-red-400'
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                  <span className='font-bold'>5</span>
                </div>
                <div className='flex-1 mx-4 bg-white/20 rounded-full h-2'>
                  <div
                    className='bg-accent-lime h-2 rounded-full'
                    style={{ width: '75%' }}
                  />
                </div>
                <div className='flex items-center gap-1 text-white'>
                  <span
                    className='material-symbols-outlined text-yellow-400'
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    monetization_on
                  </span>
                  <span className='font-bold'>340</span>
                </div>
              </div>

              {/* Question */}
              <h3 className='font-display text-2xl font-bold text-white mb-1'>
                Tentukan Statusnya!
              </h3>
              <p className='text-white/70 text-sm mb-6'>
                Tarik kartu ke kategori yang tepat.
              </p>

              {/* Drop zones */}
              <div className='grid grid-cols-2 gap-3 mb-16'>
                <div className='border-2 border-dashed border-accent-lime/50 bg-accent-lime/5 rounded-xl p-4 flex flex-col items-center gap-2'>
                  <span
                    className='material-symbols-outlined text-accent-lime text-3xl'
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span className='text-white font-bold text-sm'>HALAL</span>
                </div>
                <div className='border-2 border-dashed border-danger/50 bg-danger/5 rounded-xl p-4 flex flex-col items-center gap-2'>
                  <span
                    className='material-symbols-outlined text-danger text-3xl'
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    cancel
                  </span>
                  <span className='text-white font-bold text-sm'>HARAM</span>
                </div>
              </div>

              {/* Draggable card (decorative) */}
              <div className='absolute bottom-8 left-1/2 -translate-x-1/2 w-48 bg-white rounded-xl p-3 border-b-[4px] border-surface-variant shadow-lg flex items-center gap-3 cursor-grab'>
                <div className='w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0'>
                  <span className='material-symbols-outlined text-primary-700 text-xl'>
                    candlestick_chart
                  </span>
                </div>
                <span className='text-dark text-xs font-semibold leading-tight'>
                  Investasi Saham Syariah
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
