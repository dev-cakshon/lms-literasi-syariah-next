'use client';

import '@/lib/env';

import { CourseSection } from '@/components/landing-page/CourseSection';
import { FeatureSection } from '@/components/landing-page/FeatureSection';
import { Footer } from '@/components/landing-page/Footer';
import { HeroSection } from '@/components/landing-page/HeroSection';
import { Navbar } from '@/components/landing-page/Navbar';

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <CourseSection />
      <Footer />
    </main>
  );
}
