'use client';

import * as React from 'react';

import { MobileRedirectScreen } from '@/components/MobileRedirectScreen';

export const MobileGate = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (isMobile) return <MobileRedirectScreen />;
  return <>{children}</>;
};
