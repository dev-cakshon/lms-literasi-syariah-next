'use client';

import { User } from 'lucide-react';
import { useMemo } from 'react';

import { useMyCertificates } from '@/hooks/use-certificates';
import { useLeaderboard } from '@/hooks/use-realtime';

import { useAuth } from '@/contexts/AuthContext';

import { BADGE_DEFINITIONS } from './badgeDefinitions';
import { ProgressRing } from './ProgressRing';

import type { UserProfile } from '@/types';

const isProfileLoading = (
  loading: boolean,
  profile: UserProfile | null,
): profile is null => loading || profile === null;

function getBadgeProgressPct(totalPoints: number): number {
  const thresholds = BADGE_DEFINITIONS.map((b) => b.pointsToUnlock).sort(
    (a, b) => a - b,
  );

  const maxThreshold = thresholds[thresholds.length - 1] ?? 0;
  if (totalPoints >= maxThreshold) return 100;

  let lower = 0;
  let upper = maxThreshold;
  for (let i = 0; i < thresholds.length; i++) {
    if ((thresholds[i] ?? 0) <= totalPoints) {
      lower = thresholds[i] ?? 0;
    } else {
      upper = thresholds[i] ?? maxThreshold;
      break;
    }
  }

  if (upper === lower) return 100;
  return Math.round(((totalPoints - lower) / (upper - lower)) * 100);
}

interface StatTileProps {
  label: string;
  value: string | number;
  icon: string;
  iconColor: string;
}

function StatTile({ label, value, icon, iconColor }: StatTileProps) {
  return (
    <div className='bg-white/10 backdrop-blur-md rounded-xl p-2.5 md:p-3 flex flex-col items-center md:items-start border border-white/20'>
      <span className='text-[10px] uppercase tracking-wider font-bold opacity-70 text-white'>
        {label}
      </span>
      <div className='flex items-center gap-1.5 mt-0.5'>
        <span
          className={`material-symbols-outlined icon-fill text-xl ${iconColor}`}
        >
          {icon}
        </span>
        <span className='text-white font-bold text-lg leading-none'>
          {value}
        </span>
      </div>
    </div>
  );
}

export const ProfilePicture = () => {
  const { userProfile, loading } = useAuth();

  if (isProfileLoading(loading, userProfile)) {
    return (
      <div className='flex items-center justify-center'>
        <div className='w-48 h-48 rounded-full bg-white/20 animate-pulse' />
      </div>
    );
  }

  const ringPct = getBadgeProgressPct(userProfile.totalPoints ?? 0);

  return (
    <div className='relative z-10 shrink-0 rounded-full shadow-[0_4px_25px_rgba(48,107,17,0.4)]'>
      <ProgressRing
        percentage={ringPct}
        size={192}
        strokeWidth={8}
        trackClassName='text-[#b0f58b]/60'
      >
        <div className='w-44 h-44 rounded-full border-4 border-white overflow-hidden bg-gradient-to-br from-primary-400 via-cyan-500 to-blue-500 flex items-center justify-center text-white'>
          {userProfile.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userProfile.photoURL}
              alt={userProfile.name}
              className='w-full h-full object-cover'
            />
          ) : (
            <User className='w-16 h-16' />
          )}
        </div>
      </ProgressRing>
    </div>
  );
};

export const ProfileInfo = () => {
  const { userProfile, loading } = useAuth();
  const { data: leaderboardData, loading: leaderboardLoading } =
    useLeaderboard();
  const { certificates, loading: certsLoading } = useMyCertificates();

  const userRank = useMemo(() => {
    if (!userProfile) return null;
    const idx = leaderboardData.findIndex((u) => u.uid === userProfile.uid);
    return idx !== -1 ? idx + 1 : null;
  }, [leaderboardData, userProfile]);

  if (isProfileLoading(loading, userProfile)) {
    return (
      <div className='flex flex-col justify-center h-full space-y-4 animate-pulse flex-grow z-10'>
        <div className='space-y-2'>
          <div className='h-7 w-44 rounded bg-white/30' />
          <div className='h-4 w-32 rounded bg-white/20' />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='h-16 rounded-xl bg-white/20' />
          ))}
        </div>
      </div>
    );
  }

  const rankDisplay = leaderboardLoading
    ? '—'
    : userRank !== null
      ? `#${userRank}`
      : '>10';

  const certCount = certsLoading ? '—' : certificates.length;

  return (
    <div className='flex flex-col justify-center space-y-3 md:space-y-4 flex-grow z-10 text-white text-center md:text-left'>
      <div>
        <h1 className='text-2xl md:text-3xl font-bold font-display text-white leading-tight'>
          {userProfile.name}
        </h1>
        <p className='text-sm md:text-base opacity-80 mt-0.5'>Santri Digital</p>
      </div>

      <div className='grid grid-cols-2 gap-3 justify-center md:justify-start'>
        <StatTile
          label='Total Poin'
          value={userProfile.totalPoints?.toLocaleString() ?? 0}
          icon='stars'
          iconColor='text-amber-300'
        />
        <StatTile
          label='Lencana'
          value={userProfile.badges?.length ?? 0}
          icon='military_tech'
          iconColor='text-[var(--color-accent-lime)]'
        />
        <StatTile
          label='Rank'
          value={rankDisplay}
          icon='emoji_events'
          iconColor='text-white'
        />
        <StatTile
          label='Sertifikat'
          value={certCount}
          icon='workspace_premium'
          iconColor='text-[var(--color-tertiary-fixed-dim)]'
        />
      </div>
    </div>
  );
};

export const ProfileOverview = () => {
  return (
    <section className='bg-gradient-to-br from-[#2c7865] to-[var(--color-emerald-deep)] rounded-3xl shadow-md relative overflow-hidden flex flex-col md:flex-row gap-6 items-center p-5 md:p-7 md:gap-8'>
      <div
        className='absolute inset-0 opacity-10 pointer-events-none'
        style={{
          backgroundImage:
            'radial-gradient(circle at 20px 20px, white 2%, transparent 0%), radial-gradient(circle at 60px 60px, white 2%, transparent 0%)',
          backgroundSize: '80px 80px',
        }}
      />
      <ProfilePicture />
      <ProfileInfo />
    </section>
  );
};
