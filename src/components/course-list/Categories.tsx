'use client';

import {
  type LucideIcon,
  BriefcaseBusiness,
  Calculator,
  Landmark,
  Shield,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import { CategoryItem } from './CategoryItem';

interface CategoriesProps {
  items: { _id: string; name: string }[];
}

const iconMap: Record<{ name: string }['name'], LucideIcon> = {
  'Fiqih Muamalah': BriefcaseBusiness,
  'Investasi Syariah': TrendingUp,
  'Keuangan Syariah': Wallet,
  'Akuntansi Syariah': Calculator,
  'Perbankan Syariah': Landmark,
  'Asuransi Syariah': Shield,
};

export const Categories = ({ items }: CategoriesProps) => {
  return (
    <div className='flex items-center gap-x-2 overflow-x-auto pb-2'>
      {items.map((item, idx) => {
        return (
          <CategoryItem
            key={idx}
            label={item.name}
            icon={iconMap[item.name]}
            value={item._id}
          />
        );
      })}
    </div>
  );
};
