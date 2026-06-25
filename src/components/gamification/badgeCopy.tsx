import {
  BookOpenCheck,
  Medal,
  PartyPopper,
  ShieldCheck,
  Trophy,
} from 'lucide-react';

import type { Badge } from '@/types';

export const BADGE_COPY: Record<
  Badge,
  { label: string; labelId: string; description: string }
> = {
  newcomer: {
    label: 'Newcomer',
    labelId: 'Perintis Baru',
    description: 'Selamat datang. Akunmu berhasil dibuat dan siap belajar.',
  },
  first_step: {
    label: 'First Step',
    labelId: 'Langkah Awal',
    description: 'Kamu menyelesaikan chapter pertamamu. Lanjutkan!',
  },
  active_learner: {
    label: 'Active Learner',
    labelId: 'Pelajar Aktif',
    description: 'Kamu aktif menyelesaikan aktivitas pembelajaran.',
  },
  perfect_score: {
    label: 'Perfect Score',
    labelId: 'Nilai Sempurna',
    description: 'You achieved 100% on a quiz. Excellent work!',
  },
  top_3: {
    label: 'Top 3',
    labelId: 'Tiga Besar',
    description: 'You reached the top 3 on the leaderboard.',
  },
  number_1: {
    label: 'Number 1',
    labelId: 'Nomor Wahid',
    description: 'Luar biasa. Kamu berada di posisi puncak leaderboard.',
  },
};

export const getBadgeIcon = (badge: Badge) => {
  switch (badge) {
    case 'newcomer':
      return <PartyPopper className='h-5 w-5 text-primary-700' />;
    case 'first_step':
      return <BookOpenCheck className='h-5 w-5 text-primary-700' />;
    case 'active_learner':
      return <Medal className='h-5 w-5 text-primary-700' />;
    case 'perfect_score':
      return <ShieldCheck className='h-5 w-5 text-primary-700' />;
    default:
      return <Trophy className='h-5 w-5 text-primary-700' />;
  }
};
