import type { LucideIcon } from 'lucide-react';
import {
  BookOpenCheck,
  Medal,
  PartyPopper,
  ShieldCheck,
  Star,
  Trophy,
} from 'lucide-react';

export type BadgeRarity = 'common' | 'rare' | 'legendary';

export interface BadgeDefinition {
  id: string;
  label: string;
  description: string;
  Icon: LucideIcon;
  rarity: BadgeRarity;
  pointsToUnlock: number;
  tierGradient: [string, string];
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'newcomer',
    label: 'Newcomer',
    description: 'Membuat akun pertama di platform',
    Icon: PartyPopper,
    rarity: 'common',
    pointsToUnlock: 0,
    tierGradient: ['#FFD700', '#B8860B'],
  },
  {
    id: 'first_step',
    label: 'First Step',
    description: 'Menyelesaikan chapter pertama',
    Icon: BookOpenCheck,
    rarity: 'common',
    pointsToUnlock: 10,
    tierGradient: ['#E0E0E0', '#757575'],
  },
  {
    id: 'active_learner',
    label: 'Active Learner',
    description: 'Menyelesaikan aktivitas belajar',
    Icon: Medal,
    rarity: 'rare',
    pointsToUnlock: 50,
    tierGradient: ['#CD7F32', '#8B4513'],
  },
  {
    id: 'perfect_score',
    label: 'Perfect Score',
    description: 'Meraih nilai 100% pada kuis',
    Icon: ShieldCheck,
    rarity: 'rare',
    pointsToUnlock: 100,
    tierGradient: ['#9C27B0', '#4A148C'],
  },
  {
    id: 'top_3',
    label: 'Top 3',
    description: 'Masuk peringkat 3 besar leaderboard',
    Icon: Trophy,
    rarity: 'legendary',
    pointsToUnlock: 200,
    tierGradient: ['#00BCD4', '#006064'],
  },
  {
    id: 'number_1',
    label: 'Number 1',
    description: 'Menjadi peringkat 1 di leaderboard',
    Icon: Star,
    rarity: 'legendary',
    pointsToUnlock: 500,
    tierGradient: ['#F44336', '#B71C1C'],
  },
];
