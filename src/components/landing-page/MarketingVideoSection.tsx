'use client';

import * as React from 'react';

import { landingMedia } from '@/constant/landing-media';

import { VideoEmbed } from './VideoEmbed';

export const MarketingVideoSection = () => {
  return (
    <section className='py-24 bg-white'>
      <div className='layout'>
        <div className='text-center mb-14'>
          <p className='text-primary-700 tracking-widest uppercase text-sm font-bold mb-4'>
            Lihat Aksinya
          </p>
          <h2 className='font-display text-3xl md:text-4xl font-bold text-dark'>
            Sekilas Tentang Eduloca
          </h2>
        </div>

        <div className='mx-auto max-w-3xl'>
          <VideoEmbed
            videoId={landingMedia.marketingVideoId}
            title='Video Perkenalan Eduloca'
          />
        </div>
      </div>
    </section>
  );
};
