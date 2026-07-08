'use client';

import Image from 'next/image';
import * as React from 'react';

import { TeamMember } from '@/constant/team';

interface TeamCardProps {
  member: TeamMember;
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export const TeamCard = ({ member }: TeamCardProps) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className='overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.06)]'>
      {imgError ? (
        <div className='flex aspect-[3/4] w-full items-center justify-center bg-primary-100 text-4xl font-bold text-primary-700'>
          {getInitials(member.name)}
        </div>
      ) : (
        <div className='relative aspect-[3/4] w-full bg-surface-container'>
          <Image
            src={member.photoPath}
            alt={member.name}
            fill
            className='object-cover'
            onError={() => setImgError(true)}
          />
        </div>
      )}

      <div className='p-4 text-center'>
        <p className='font-bold text-dark'>{member.name}</p>
        <p className='text-sm text-on-surface-soft'>{member.role}</p>
      </div>
    </div>
  );
};
