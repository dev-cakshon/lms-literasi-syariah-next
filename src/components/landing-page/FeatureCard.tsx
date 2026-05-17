import * as React from 'react';

export interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className='bg-white rounded-xl p-8 shadow-sm border border-surface-variant relative overflow-hidden group hover:shadow-md transition-shadow duration-300'>
      {/* Circle icon */}
      <div className='w-14 h-14 bg-surface-variant rounded-full flex items-center justify-center mb-6 text-primary-700 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300'>
        <span
          className='material-symbols-outlined text-3xl'
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>

      <h3 className='font-display text-lg font-bold text-dark mb-3'>{title}</h3>
      <p className='text-on-surface-soft leading-relaxed'>{description}</p>

      {/* Watermark star */}
      <span className='material-symbols-outlined absolute -right-6 -bottom-6 text-8xl text-surface-variant opacity-50 watermark-star pointer-events-none group-hover:scale-110 transition-transform duration-300'>
        brightness_5
      </span>
    </div>
  );
};
