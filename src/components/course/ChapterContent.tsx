'use client';

import ReactMarkdown from 'react-markdown';

import { ProgressRing } from '@/components/dashboard/ProgressRing';

import { SlidesPlayer } from './SlidesPlayer';
import { YoutubePlayer } from './YoutubePlayer';

interface ChapterContentProps {
  courseId: string;
  chapterId: string;
  title: string;
  mediaUrl: string;
  mediaType: 'youtube' | 'slides';
  content: string;
  progressPercent?: number;
  completedCount?: number;
  totalCount?: number;
}

export const ChapterContent = ({
  title,
  mediaUrl,
  mediaType,
  content,
  progressPercent,
  completedCount,
  totalCount,
}: ChapterContentProps) => {
  return (
    <div className='flex flex-col max-w-6xl mx-auto pb-20'>
      <div className='p-4 flex flex-col md:flex-row items-center justify-between gap-3'>
        <h2 className='text-2xl font-semibold'>{title}</h2>
        {progressPercent !== undefined && (
          <div className='flex items-center gap-3 shrink-0'>
            <ProgressRing
              percentage={progressPercent}
              size={48}
              strokeWidth={4}
            >
              <span className='text-[9px] font-bold text-primary-700'>
                {progressPercent}%
              </span>
            </ProgressRing>
            {completedCount !== undefined && totalCount !== undefined && (
              <p className='text-xs font-medium text-slate-600 whitespace-nowrap'>
                {completedCount}/{totalCount} selesai
              </p>
            )}
          </div>
        )}
      </div>

      <div className='px-4'>
        {mediaType === 'slides' ? (
          <SlidesPlayer url={mediaUrl} title={title} />
        ) : (
          <YoutubePlayer url={mediaUrl} title={title} />
        )}
      </div>

      <div>
        <div className='p-4 prose prose-slate max-w-none'>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        <h2 className='text-xl font-semibold mt-2 py-1 px-4'>
          Course Attachments
        </h2>
        <div className='p-4'></div>
      </div>
    </div>
  );
};
