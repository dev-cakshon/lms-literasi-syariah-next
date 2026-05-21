'use client';

import {
  Award,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Presentation,
} from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { useCourseProgress } from '@/hooks/use-realtime';

import { PointsToast } from '@/components/gamification';

import { MarkCompleteButton } from './MarkCompleteButton';
import { SlidesPlayer } from './SlidesPlayer';
import { YoutubePlayer } from './YoutubePlayer';

interface ChapterContentProps {
  courseId: string;
  chapterId: string;
  title: string;
  mediaUrl: string;
  mediaType: 'youtube' | 'slides';
  content: string;
  chapterOrdinal: number;
  courseTitle?: string;
}

export const ChapterContent = ({
  courseId,
  chapterId,
  title,
  mediaUrl,
  mediaType,
  content,
  chapterOrdinal,
}: ChapterContentProps) => {
  const { completedChapters } = useCourseProgress(courseId);
  const isCompleted = completedChapters.includes(chapterId);
  const [toastPoints, setToastPoints] = useState(0);

  return (
    <div className='max-w-[960px] mt-4 mx-auto px-4 md:px-6 pt-4 pb-16 flex flex-col gap-8'>
      {/* ① Header row */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <h1 className='h2 text-primary-700'>
          BAB {chapterOrdinal} · {title}
        </h1>
        {mediaType === 'youtube' ? (
          <span className='bg-secondary-container text-on-secondary-container text-sm font-bold tracking-[0.05em] px-4 py-1.5 rounded-full flex items-center gap-2'>
            <PlayCircle className='h-4 w-4' />
            Video YouTube
          </span>
        ) : (
          <span className='bg-surface-container-high text-on-surface-variant text-sm font-bold tracking-[0.05em] px-4 py-1.5 rounded-full flex items-center gap-2 border border-outline-variant'>
            <Presentation className='h-4 w-4' />
            Slides
          </span>
        )}
      </div>

      {/* ② Player frame */}
      {mediaUrl && (
        <div
          className='relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-surface-variant'
          style={{ boxShadow: '0 4px 20px rgba(5,95,77,0.05)' }}
        >
          {mediaType === 'slides' ? (
            <SlidesPlayer url={mediaUrl} title={title} />
          ) : (
            <YoutubePlayer url={mediaUrl} title={title} />
          )}
          {isCompleted && (
            <div className='absolute top-3 left-3 bg-surface-container-lowest text-action-green text-sm font-bold tracking-[0.05em] rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-sm border border-action-green/20 pointer-events-none'>
              <CheckCircle2 className='h-4 w-4' />
              Sudah Ditonton
            </div>
          )}
        </div>
      )}

      {/* ③ Notes card */}
      {content && (
        <div
          className='bg-surface-container-lowest rounded-2xl p-6 md:p-8 border-2 border-surface-variant relative overflow-hidden'
          style={{ boxShadow: '0 4px 20px rgba(5,95,77,0.05)' }}
        >
          <div
            aria-hidden
            className='absolute top-0 right-0 w-[150px] h-[150px] pointer-events-none'
            style={{
              backgroundImage: `url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 0L61.2257 38.7743L100 50L61.2257 61.2257L50 100L38.7743 61.2257L0 50L38.7743 38.7743L50 0Z" fill="%23a6f1da" fill-opacity="0.1"/></svg>')`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'top right',
              backgroundSize: '150px',
            }}
          />
          <h2 className='h3 text-primary-700 mb-4 flex items-center gap-2'>
            <BookOpen className='h-5 w-5' />
            Catatan Materi
          </h2>
          <div className='prose prose-slate max-w-none text-on-surface-variant prose-blockquote:border-l-primary prose-blockquote:bg-primary-50 prose-blockquote:rounded-r-lg prose-blockquote:not-italic'>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* ④ XP toast */}
      <PointsToast points={toastPoints} isOpen={toastPoints > 0} />

      {/* ⑤ Completion footer */}
      {!isCompleted ? (
        <div
          className='bg-surface-container-lowest rounded-2xl p-6 md:p-8 border-2 border-surface-variant relative overflow-hidden flex flex-col items-center justify-center text-center gap-6'
          style={{ boxShadow: '0 4px 20px rgba(5,95,77,0.05)' }}
        >
          <div
            aria-hidden
            className='absolute inset-0 pointer-events-none'
            style={{
              backgroundImage: `url('data:image/svg+xml;utf8,<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M166.5 63.5C188.1 82.3 197.9 113.6 189.9 140.7C182 167.9 156.4 190.8 128.5 197.2C100.6 203.6 70.4 193.4 47.9 174.5C25.4 155.5 10.6 127.8 4.2 98.4C-2.3 68.9 2.1 37.6 20.3 17.5C38.6 -2.7 70.8 -11.6 100.6 8.5C130.4 28.5 144.9 44.7 166.5 63.5Z" fill="%23b0f58b" fill-opacity="0.3"/></svg>')`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center right',
            }}
          />
          <h3 className='h3 text-primary-700'>Sudah paham materinya?</h3>
          <MarkCompleteButton
            courseId={courseId}
            chapterId={chapterId}
            onComplete={setToastPoints}
          />
        </div>
      ) : (
        <div className='bg-secondary-container/20 border-2 border-action-green/30 rounded-2xl p-6 flex items-center gap-4'>
          <div className='bg-secondary-container text-on-secondary-container p-3 rounded-full shrink-0'>
            <Award className='h-8 w-8' />
          </div>
          <div>
            <h3 className='h3 text-primary-700'>Bab Selesai</h3>
            <p className='text-amber-700'>+10 XP diperoleh</p>
          </div>
        </div>
      )}
    </div>
  );
};
