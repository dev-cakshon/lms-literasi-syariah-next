'use client';

import { User } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

import type { UserProfile } from '@/types';

const isProfileLoading = (
  loading: boolean,
  profile: UserProfile | null,
): profile is null => {
  return loading || profile === null;
};

export const ProfilePicture = () => {
  const { userProfile, loading } = useAuth();

  if (isProfileLoading(loading, userProfile)) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-gray-200 animate-pulse border-4 border-white' />
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center h-full'>
      <div className='w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-linear-to-br from-primary-400 via-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-lg border-4 border-white'>
        {userProfile.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={userProfile.photoURL}
            alt={userProfile.name}
            className='w-full h-full rounded-full object-cover'
          />
        ) : (
          <User className='w-16 h-16' />
        )}
      </div>
    </div>
  );
};

export const ProfileInfo = () => {
  const { userProfile, loading } = useAuth();

  if (isProfileLoading(loading, userProfile)) {
    return (
      <div className='flex flex-col justify-center h-full space-y-4 animate-pulse'>
        <div className='space-y-2'>
          <div className='h-6 w-44 rounded bg-gray-300' />
          <div className='h-4 w-56 rounded bg-gray-200' />
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div className='h-10 rounded bg-gray-200' />
          <div className='h-10 rounded bg-gray-200' />
          <div className='h-10 rounded bg-gray-200' />
          <div className='h-10 rounded bg-gray-200' />
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col justify-center h-full space-y-4'>
      <div>
        <h3 className='text-xl font-bold text-ink'>{userProfile.name}</h3>
        <p className='text-sm text-gray-500'>{userProfile.email}</p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <div className='bg-primary-100 text-primary-700 rounded-md px-3 py-2'>
          <p className='text-xs text-gray-600'>Total Poin</p>
          <p className='font-bold text-sm'>{userProfile.totalPoints}</p>
        </div>
        <div className='bg-blue-100 text-blue-700 rounded-md px-3 py-2'>
          <p className='text-xs text-gray-600'>Jumlah Badge</p>
          <p className='font-bold text-sm'>{userProfile.badges.length}</p>
        </div>
        <div className='bg-emerald-100 text-emerald-700 rounded-md px-3 py-2 sm:col-span-2'>
          <p className='text-xs text-gray-600'>Role</p>
          <p className='font-bold text-sm capitalize'>{userProfile.role}</p>
        </div>
      </div>
    </div>
  );
};

// Keep backward-compatible export
export const ProfileOverview = () => {
  return (
    <div className='flex items-center gap-6'>
      <ProfilePicture />
      <ProfileInfo />
    </div>
  );
};
