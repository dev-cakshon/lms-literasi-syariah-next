'use client';

import { Bot } from 'lucide-react';
import { useContext } from 'react';

import { CourseLayoutContext } from '@/app/(main)/(student)/(course)/course/[courseId]/CourseLayoutContext';
import { useAuth } from '@/contexts/AuthContext';

export function ChatbotFab() {
  const { isChatOpen, isChatFabHidden, setChatOpen } =
    useContext(CourseLayoutContext);
  const { userProfile } = useAuth();

  if (isChatFabHidden || isChatOpen || userProfile?.chatbotEnabled !== true)
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
