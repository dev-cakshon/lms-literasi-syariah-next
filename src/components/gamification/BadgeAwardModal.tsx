'use client';

import { Award, ShieldCheck, Trophy } from 'lucide-react';

import Button from '@/components/buttons/Button';
import { Badge as UIBadge } from '@/components/ui/badge';
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
  perfect_score: {
    label: 'Perfect Score',
    description: 'You achieved 100% on a quiz. Excellent work!',
  },
  top_3: {
    label: 'Top 3',
    description: 'You reached the top 3 on the leaderboard.',
  },
};

const getBadgeIcon = (badge: Badge) => {
  if (badge === 'perfect_score') {
    return <ShieldCheck className='h-5 w-5 text-primary-700' />;
  }

  return <Trophy className='h-5 w-5 text-primary-700' />;
};

export const BadgeAwardModal = ({
  isOpen,
  badges,
  onClose,
}: BadgeAwardModalProps) => {
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

        <div className='space-y-3'>
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
