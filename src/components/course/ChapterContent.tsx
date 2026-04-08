'use client';

import ReactMarkdown from 'react-markdown';

import { YoutubePlayer } from './YoutubePlayer';

interface ChapterContentProps {
  courseId: string;
  chapterId: string;
  title: string;
  videoUrl: string;
  content: string;
}

export const ChapterContent = ({
  title,
  videoUrl,
  content,
}: ChapterContentProps) => {
  return (
    <div className='flex flex-col max-w-6xl mx-auto pb-20'>
      <div className='p-4 flex flex-col md:flex-row items-center justify-between'>
        <h2 className='text-2xl font-semibold'>{title}</h2>
      </div>

      <div className='px-4'>
        <YoutubePlayer videoUrl={videoUrl} title={title} />
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
