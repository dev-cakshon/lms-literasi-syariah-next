import React from 'react';

interface SlidesPlayerProps {
  url: string;
  title?: string;
}

function getSlidesId(url: string): string | null {
  const match = url.match(/\/presentation\/d\/([\w-]+)/);
  return match ? match[1] : null;
}

export const SlidesPlayer: React.FC<SlidesPlayerProps> = ({ url, title }) => {
  if (!url) return null;
  const id = getSlidesId(url);
  if (!id) return <div className='text-red-500'>Invalid Google Slides URL</div>;
  return (
    <iframe
      width='70%'
      height='400'
      src={`https://docs.google.com/presentation/d/${id}/embed`}
      title={title || 'Google Slides presentation'}
      frameBorder='0'
      allowFullScreen
    />
  );
};
