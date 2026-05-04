import { cn } from '@/lib/utils';

import type { LeaderboardUser } from '@/types';

interface LeaderboardRowProps {
  user: LeaderboardUser;
  rank: number;
  isCurrentUser: boolean;
}

const MEDALLION: Record<
  1 | 2 | 3,
  { fill: string; stroke: string; textFill: string }
> = {
  1: { fill: '#FF9800', stroke: '#D97706', textFill: '#78350F' },
  2: { fill: '#D9EDBF', stroke: '#90D26D', textFill: '#2C7865' },
  3: { fill: '#90D26D', stroke: '#83BD63', textFill: '#FEF3C7' },
};

function RankMedallion({ rank }: { rank: 1 | 2 | 3 }) {
  const m = MEDALLION[rank];
  return (
    <svg
      width='36'
      height='36'
      viewBox='0 0 36 36'
      aria-label={`Rank ${rank}`}
      className='shrink-0'
    >
      <circle
        cx='18'
        cy='18'
        r='16'
        fill={m.fill}
        stroke={m.stroke}
        strokeWidth='1.5'
      />
      <text
        x='18'
        y='23'
        textAnchor='middle'
        fontSize='14'
        fontWeight='bold'
        fill={m.textFill}
        fontFamily='inherit'
      >
        {rank}
      </text>
    </svg>
  );
}

export const LeaderboardRow = ({
  user,
  rank,
  isCurrentUser,
}: LeaderboardRowProps) => {
  const isTopThree = rank <= 3;

  if (isTopThree) {
    const cardBase =
      rank === 1
        ? 'bg-gradient-to-r from-[#FF9800]/10 to-[#FF9800]/5 border border-[#FF9800]/25'
        : rank === 2
          ? 'bg-[#D9EDBF]/30 border border-[#90D26D]/20'
          : 'bg-primary-500/7 border border-primary-500/15';

    return (
      <div
        className={cn(
          'flex items-center gap-4 rounded-xl border p-4 shadow-sm',
          isCurrentUser
            ? 'border-[#90D26D] bg-[#90D26D]/8 ring-1 ring-[#90D26D]/30'
            : cardBase,
        )}
      >
        <RankMedallion rank={rank as 1 | 2 | 3} />

        <div className='w-9 h-9 rounded-full bg-linear-to-br from-primary-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shrink-0'>
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className='flex-1 min-w-0'>
          <p
            className={cn(
              'font-semibold text-sm truncate',
              isCurrentUser ? 'text-emerald-800' : 'text-gray-800',
            )}
          >
            {user.name}
            {isCurrentUser && (
              <span className='ml-2 text-xs font-normal bg-[#D9EDBF] text-primary-600'>
                (Kamu)
              </span>
            )}
          </p>
        </div>

        <span className='font-bold text-base text-primary-500 shrink-0'>
          {user.totalPoints.toLocaleString()} pts
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 last:border-b-0',
        isCurrentUser &&
          'rounded-lg border border-[#90D26D] bg-[#90D26D]/8 ring-1 ring-[#90D26D]/30',
      )}
    >
      <span className='w-8 text-center text-sm font-bold text-gray-400 shrink-0'>
        {rank}
      </span>

      <div className='w-8 h-8 rounded-full bg-linear-to-br from-primary-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-xs shrink-0'>
        {user.name.charAt(0).toUpperCase()}
      </div>

      <span
        className={cn(
          'flex-1 text-sm font-medium truncate',
          isCurrentUser ? 'text-emerald-800' : 'text-gray-700',
        )}
      >
        {user.name}
        {isCurrentUser && (
          <span className='ml-2 text-xs font-normal bg-[#D9EDBF] text-primary-600'>
            (Kamu)
          </span>
        )}
      </span>

      <span className='font-semibold text-sm text-primary-500 shrink-0'>
        {user.totalPoints.toLocaleString()} pts
      </span>
    </div>
  );
};
