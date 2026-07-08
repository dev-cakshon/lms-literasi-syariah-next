'use client';

import * as React from 'react';

interface VideoEmbedProps {
  videoId: string;
  title: string;
  thumbnailUrl?: string;
}

export const VideoEmbed = ({
  videoId,
  title,
  thumbnailUrl,
}: VideoEmbedProps) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [thumbnailFailed, setThumbnailFailed] = React.useState(false);

  const resolvedThumbnail =
    thumbnailUrl ??
    `https://img.youtube.com/vi/${videoId}/${
      thumbnailFailed ? 'hqdefault' : 'maxresdefault'
    }.jpg`;

  return (
    <div className='relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-container shadow-lg'>
      {isPlaying ? (
        <iframe
          className='h-full w-full'
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow='autoplay; encrypted-media; picture-in-picture'
          allowFullScreen
        />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedThumbnail}
            alt={title}
            loading='lazy'
            className='h-full w-full object-cover'
            onError={() => setThumbnailFailed(true)}
          />
          <button
            type='button'
            onClick={() => setIsPlaying(true)}
            aria-label={`Putar video: ${title}`}
            className='absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30'
          >
            <span className='flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl transition-transform hover:scale-105'>
              <span className='material-symbols-outlined text-4xl text-primary-700'>
                play_arrow
              </span>
            </span>
          </button>
        </>
      )}
    </div>
  );
};
