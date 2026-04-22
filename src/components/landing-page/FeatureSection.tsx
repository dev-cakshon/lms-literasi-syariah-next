'use client';

import { Award, BookOpen, GraduationCap, MonitorPlay } from 'lucide-react';
import * as React from 'react';

import { FeatureCard } from './FeatureCard';

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
      icon: <GraduationCap className='h-8 w-8 text-primary-600' />,
      title: 'Pakar Ekonomi Syariah Berpengalaman',
      description:
        'Belajar langsung dari praktisi dan akademisi yang ahli di bidang ekonomi dan keuangan syariah dengan pengalaman puluhan tahun.',
    },
    {
      icon: <BookOpen className='h-8 w-8 text-primary-600' />,
      title: 'Materi Komprehensif Berbasis Syariah',
      description:
        'Kurikulum lengkap dari dasar fiqih muamalah hingga aplikasi praktis dalam perbankan, investasi, dan manajemen keuangan syariah modern.',
    },
    {
      icon: <Award className='h-8 w-8 text-primary-600' />,
      title: 'Sertifikat Profesional Terakreditasi',
      description:
        'Dapatkan sertifikat yang diakui industri untuk meningkatkan kredibilitas profesional Anda di bidang keuangan dan ekonomi syariah.',
    },
    {
      icon: <MonitorPlay className='h-8 w-8 text-primary-600' />,
      title: 'Pembelajaran Fleksibel & Interaktif',
      description:
        'Akses materi kapan saja, di mana saja dengan video berkualitas HD, studi kasus nyata, dan forum diskusi dengan sesama praktisi syariah.',
    },
  ];

  return (
    <section id='feature' className='bg-ivory py-20'>
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
};
