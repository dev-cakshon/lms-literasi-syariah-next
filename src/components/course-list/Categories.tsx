'use client';

import {
  BarChart2,
  Calculator,
  Landmark,
  LucideIcon,
  Scale,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

import { CategoryItem } from './CategoryItem';

interface CategoriesProps {
  items: { _id: string; name: string }[];
}

const iconMap: Record<string, LucideIcon> = {
  'Fiqih Muamalah': Scale,
  'Investasi Syariah': TrendingUp,
  'Keuangan Syariah': Landmark,
  'Akuntansi Syariah': Calculator,
  'Perbankan Syariah': Landmark,
  'Asuransi Syariah': ShieldCheck,
};

export const Categories = ({ items }: CategoriesProps) => {
  return (
    <div className='flex items-center gap-x-2 overflow-x-auto pb-2'>
      {items.map((item) => {
        return (
          <CategoryItem
            key={item._id}
            label={item.name}
            icon={iconMap[item.name] ?? BarChart2}
            value={item._id}
          />
        );
      })}
    </div>
  );
};
