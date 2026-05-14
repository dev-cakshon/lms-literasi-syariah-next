'use client';

import { useState } from 'react';

import ReactMarkdown from 'react-markdown';

import { useCourseProgress } from '@/hooks/use-realtime';
import { getChapterEmoji } from '@/lib/courseUtils';

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
  courseTitle: string;
}

export const ChapterContent = ({
  courseId,
  chapterId,
  title,
  mediaUrl,
  mediaType,
  content,
  chapterOrdinal,
  courseTitle,
}: ChapterContentProps) => {
  const emoji = getChapterEmoji(chapterOrdinal);
  const { completedChapters } = useCourseProgress(courseId);
  const isCompleted = completedChapters.includes(chapterId);
  const [toastPoints, setToastPoints] = useState(0);

  return (
    <div className='max-w-3/4 mx-auto pb-16 px-4 md:px-6 space-y-4 pt-4'>

      {/* ① Chapter header card */}
      <div
        className='rounded-[14px] px-6 py-5 relative overflow-hidden'
        style={{ background: 'linear-gradient(135deg, #174339 0%, #1e5548 100%)' }}
      >
        <div
          aria-hidden
          className='absolute -top-5 -right-5 w-25 h-25 rounded-full pointer-events-none'
          style={{ background: 'rgba(144,210,109,0.07)' }}
        />
        <div
          aria-hidden
          className='absolute right-8 -bottom-8 w-17.5 h-17.5 rounded-full pointer-events-none'
          style={{ background: 'rgba(255,255,255,0.04)' }}
        />

        <p className='text-[10px] font-semibold tracking-[0.8px] uppercase text-white/45 mb-2.5'>
          {courseTitle} · Bab {chapterOrdinal}
        </p>

        <div className='flex items-start gap-3.5'>
          <div
            className='w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-[26px]'
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            {emoji}
          </div>
          <div>
            <h2
              className='font-bold text-white leading-snug mb-2'
              style={{ fontFamily: 'var(--font-display, Georgia, serif)' }}
            >
              {title}
            </h2>
            <div className='flex items-center gap-2.5'>
              <div
                className='w-7 h-0.5 rounded-full'
                style={{ background: '#90d26d' }}
              />
              <span className='text-[10px] text-white/40'>
                Materi · {mediaType === 'slides' ? 'Slides' : 'Video'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ② Video / Slides block */}
      {mediaUrl && (
        <div
          className='relative rounded-xl overflow-hidden w-full'
          style={{ background: '#1a1a2e' }}
        >
          <div
            aria-hidden
            className='absolute inset-0 pointer-events-none z-10'
            style={{
              background:
                'linear-gradient(135deg, rgba(23,67,57,0.3) 0%, transparent 60%)',
            }}
          />
          <p className='absolute bottom-2.5 left-3.5 text-[10px] text-white/50 z-10 pointer-events-none select-none'>
            {mediaType === 'slides' ? '📊 Slides' : '▶ Video'} · {title}
          </p>
          {mediaType === 'slides' ? (
            <SlidesPlayer url={mediaUrl} title={title} />
          ) : (
            <YoutubePlayer url={mediaUrl} title={title} />
          )}
        </div>
      )}

      {/* ③ Prose section */}
      {content && (
        <div className='bg-white rounded-xl border border-slate-200/80 px-6 py-5'>
          <div className='flex items-center gap-2 mb-4'>
            <span className='text-[9px] font-bold tracking-[1.2px] uppercase text-slate-400'>
              📖 Penjelasan Materi
            </span>
            <div className='flex-1 h-px bg-slate-100' />
          </div>
          <div className='prose prose-slate max-w-none prose-blockquote:border-l-[#90d26d] prose-blockquote:bg-primary-50 prose-blockquote:rounded-r-lg prose-blockquote:not-italic'>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* ④ XP toast — rendered outside the completion guard so it survives unmount */}
      <PointsToast points={toastPoints} isOpen={toastPoints > 0} />

      {/* ⑤ Completion block */}
      {!isCompleted && (
        <div className='rounded-[14px] border border-slate-200 bg-white px-6 py-5'>
          <div className='flex items-start gap-3 mb-4'>
            <div className='w-9 h-9 rounded-[10px] bg-primary-50 flex items-center justify-center text-[18px] flex-shrink-0'>
              📚
            </div>
            <div>
              <p className='text-[13px] font-bold text-slate-800 leading-snug'>
                Sudah paham materinya?
              </p>
              <p className='text-[12px] text-slate-500 mt-0.5 leading-relaxed'>
                Tandai bab ini selesai untuk membuka konten berikutnya dan mendapatkan poin.
              </p>
            </div>
          </div>
          <MarkCompleteButton
            courseId={courseId}
            chapterId={chapterId}
            onComplete={setToastPoints}
            label='✅ Tandai Bab Ini Selesai'
            className='w-full justify-center rounded-[10px] py-3 text-[14px] font-bold text-white border-0'
            style={{ background: 'linear-gradient(135deg, #174339, #2c7865)' } as React.CSSProperties}
          />
        </div>
      )}

    </div>
  );
};
