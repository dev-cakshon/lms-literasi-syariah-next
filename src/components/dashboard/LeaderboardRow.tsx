'use client';

import { motion } from 'framer-motion';

import type { LeaderboardUser } from '@/types';

interface LeaderboardRowProps {
  user: LeaderboardUser;
  rank: number;
  isCurrentUser?: boolean;
  compact?: boolean;
  delay?: number;
}

const medalConfig = {
  1: {
    fill: 'url(#goldGradient)',
    ring: '#f59e0b',
    text: '#78350f',
  },
  2: {
    fill: 'url(#silverGradient)',
    ring: '#94a3b8',
    text: '#334155',
  },
  3: {
    fill: 'url(#bronzeGradient)',
    ring: '#b45309',
    text: '#451a03',
  },
} as const;

const RankMedal = ({ rank }: { rank: 1 | 2 | 3 }) => {
  const config = medalConfig[rank];

  return (
    <svg width='42' height='42' viewBox='0 0 42 42' aria-hidden='true'>
      <defs>
        <linearGradient id='goldGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#fef08a' />
          <stop offset='100%' stopColor='#f59e0b' />
        </linearGradient>
        <linearGradient id='silverGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#f8fafc' />
          <stop offset='100%' stopColor='#94a3b8' />
        </linearGradient>
        <linearGradient id='bronzeGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#fdba74' />
          <stop offset='100%' stopColor='#b45309' />
        </linearGradient>
      </defs>
      <circle
        cx='21'
        cy='21'
        r='18'
        fill={config.fill}
        stroke={config.ring}
        strokeWidth='2'
      />
      <text
        x='21'
        y='25'
        textAnchor='middle'
        fill={config.text}
        style={{ fontWeight: 800, fontSize: '14px' }}
      >
        {rank}
      </text>
    </svg>
  );
};

export const LeaderboardRow = ({
  user,
  rank,
  isCurrentUser = false,
  compact = false,
  delay = 0,
}: LeaderboardRowProps) => {
  const isTopThree = rank <= 3 && !compact;

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
      className={
        isTopThree
          ? `rounded-2xl border p-4 shadow-sm ${
              rank === 1
                ? 'border-amber-300 bg-amber-50/70'
                : rank === 2
                  ? 'border-slate-300 bg-slate-50'
                  : 'border-orange-300 bg-orange-50/70'
            }`
          : `flex items-center justify-between border-b border-gray-200 py-3 ${
              isCurrentUser ? 'bg-emerald-50/70 px-2' : ''
            }`
      }
    >
      <div className='flex min-w-0 items-center gap-3'>
        {isTopThree ? (
          <RankMedal rank={rank as 1 | 2 | 3} />
        ) : (
          <span className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700'>
            {rank}
          </span>
        )}
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold text-ink'>{user.name}</p>
          <p className='text-xs text-gray-500'>
            {user.badges.length} badge{user.badges.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <p className='text-right text-sm font-bold text-primary-700'>
        {user.totalPoints.toLocaleString()} pts
      </p>
    </motion.li>
  );
};

export type { LeaderboardRowProps };
