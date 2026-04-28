'use client';

import confetti from 'canvas-confetti';
import {
  Award,
  BookOpenCheck,
  Medal,
  PartyPopper,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import { useEffect } from 'react';

import { Badge as UIBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { Badge } from '@/types';

interface BadgeAwardModalProps {
  isOpen: boolean;
  badges: Badge[];
  onClose: () => void;
}

const BADGE_COPY: Record<Badge, { label: string; description: string }> = {
  newcomer: {
    label: 'Newcomer',
    description: 'Selamat datang. Akunmu berhasil dibuat dan siap belajar.',
  },
  first_step: {
    label: 'First Step',
    description: 'Kamu menyelesaikan chapter pertamamu. Lanjutkan!',
  },
  active_learner: {
    label: 'Active Learner',
    description: 'Kamu aktif menyelesaikan aktivitas pembelajaran.',
  },
  perfect_score: {
    label: 'Perfect Score',
    description: 'You achieved 100% on a quiz. Excellent work!',
  },
  top_3: {
    label: 'Top 3',
    description: 'You reached the top 3 on the leaderboard.',
  },
  number_1: {
    label: 'Number 1',
    description: 'Luar biasa. Kamu berada di posisi puncak leaderboard.',
  },
};

const getBadgeIcon = (badge: Badge) => {
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

export const BadgeAwardModal = ({
  isOpen,
  badges,
  onClose,
}: BadgeAwardModalProps) => {
  useEffect(() => {
    if (!isOpen || badges.length === 0) return;
    void confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'],
    });
  }, [isOpen, badges.length]);

  if (!isOpen || badges.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Award className='h-5 w-5 text-primary-700' />
            Badge Unlocked
          </DialogTitle>
          <DialogDescription>
            Great progress. You just earned {badges.length} badge
            {badges.length > 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-3 my-4'>
          {badges.map((badge) => {
            const copy = BADGE_COPY[badge];

            return (
              <div
                key={badge}
                className='rounded-md border border-primary-200 bg-primary-50 p-3'
              >
                <div className='flex items-start gap-3'>
                  <div className='mt-0.5 rounded-md bg-primary-100 p-2'>
                    {getBadgeIcon(badge)}
                  </div>
                  <div>
                    <div className='flex items-center gap-2'>
                      <p className='font-semibold text-primary-900'>
                        {copy.label}
                      </p>
                      <UIBadge variant='secondary'>New</UIBadge>
                    </div>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      {copy.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button onClick={onClose} className='w-full sm:w-auto'>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export type { BadgeAwardModalProps };
