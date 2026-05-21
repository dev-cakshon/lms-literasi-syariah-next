'use client';

import * as React from 'react';

import { FeatureCard } from './FeatureCard';

const features = [
  {
    icon: 'sports_esports',
    title: 'Belajar dengan Bermain',
    description:
      'Sistem gamifikasi membuat belajar ekonomi syariah terasa seperti bermain game. XP, level, dan tantangan menanti!',
  },
  {
    icon: 'menu_book',
    title: 'Kurikulum Syariah Lengkap',
    description:
      'Dari dasar fiqih muamalah hingga aplikasi praktis di perbankan dan investasi syariah modern.',
  },
  {
    icon: 'emoji_events',
    title: 'Naik Level, Kumpulkan Badge',
    description:
      'Setiap pencapaian dihargai. Kumpulkan badge eksklusif dan tunjukkan keahlianmu kepada dunia.',
  },
  {
    icon: 'workspace_premium',
    title: 'Sertifikat Sebagai Bukti',
    description:
      'Raih sertifikat profesional yang diakui industri sebagai bukti kompetensi ekonomi syariahmu.',
  },
];

export const FeatureSection = () => {
  return (
    <section id='feature' className='scroll-mt-20 py-24 bg-surface-soft'>
      <div className='layout'>
        {/* Section Header */}
        <div className='text-center mb-14'>
          <p className='text-primary-700 tracking-widest uppercase text-sm font-bold mb-4'>
            Mengapa Memilih Platform Kami?
          </p>
          <h2 className='font-display text-3xl md:text-4xl font-bold text-dark'>
            Apa yang Bikin Belajar di Sini Beda?
          </h2>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
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
};
