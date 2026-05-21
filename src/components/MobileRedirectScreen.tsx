'use client';

import { Logo } from '@/components/Logo';

export const MobileRedirectScreen = () => {
  const mobileAppUrl =
    process.env.NEXT_PUBLIC_MOBILE_APP_URL ?? 'https://google.com';

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center'>
      <Logo logotype='text' theme='light' size='lg' />
      <h1 className='mt-8 text-2xl font-bold text-primary-700'>
        Buka di Aplikasi Mobile
      </h1>
      <p className='mt-4 text-gray-600 max-w-sm leading-relaxed'>
        Eduloca versi web dirancang untuk tablet, laptop, dan desktop. Untuk
        pengalaman terbaik di ponsel, gunakan aplikasi mobile kami.
      </p>
      <a
        href={mobileAppUrl}
        className='mt-8 bg-primary-700 text-white px-8 py-3 rounded-full border-b-2 border-primary-500 hover:-translate-y-0.5 active:translate-y-0 active:border-b-0 transition-all duration-150 font-bold'
      >
        Buka Aplikasi Mobile
      </a>
    </div>
  );
};
