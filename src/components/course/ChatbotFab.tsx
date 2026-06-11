'use client';

import { Bot } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';

import { CourseLayoutContext } from '@/app/(main)/(student)/(course)/course/[courseId]/CourseLayoutContext';
import { useAuth } from '@/contexts/AuthContext';

export function ChatbotFab() {
  const { isChatOpen, isChatFabHidden, setChatOpen } =
    useContext(CourseLayoutContext);
  const { userProfile } = useAuth();
  const pathname = usePathname();

  // Show the FAB only while viewing a chapter — not on the course overview,
  // quiz, or any activity screen. The modal flag (isChatFabHidden) handles
  // transient overlays (e.g. the certificate modal) that appear on chapter routes.
  const isChapterRoute = /\/course\/[^/]+\/chapter\//.test(pathname);

  if (
    !isChapterRoute ||
    isChatFabHidden ||
    isChatOpen ||
    userProfile?.chatbotEnabled !== true
  )
    return null;

  return (
    <button
      type='button'
      aria-label='Buka asisten AI'
      onClick={() => setChatOpen(true)}
      className='fixed right-6 top-1/2 -translate-y-1/2 z-[55]
        w-14 h-14 rounded-full bg-primary-600 text-white
        flex items-center justify-center
        shadow-elevated-2 hover:scale-105 hover:shadow-elevated-3
        transition-all duration-200'
    >
      <Bot className='w-6 h-6' />
    </button>
  );
}
