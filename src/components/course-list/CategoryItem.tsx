'use client';

import { LucideIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';

import { cn } from '@/lib/utils';

interface CategoryItemProps {
  label: string;
  icon?: LucideIcon;
  value?: string;
}

export const CategoryItem = ({
  label,
  icon: Icon,
  value,
}: CategoryItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategoryId = searchParams.get('categoryId');
  const currentTitle = searchParams.get('title');

  const isSelected = currentCategoryId === value;

  const onClick = () => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          title: currentTitle,
          categoryId: isSelected ? null : value,
        },
      },
      { skipNull: true, skipEmptyString: true },
    );
    router.push(url);
  };

  return (
    <button
      onClick={onClick}
      type='button'
      className={cn(
        'py-2 px-3 text-sm border border-slate-200 rounded-full flex items-center gap-x-1 hover:border-primary-700 transition',
        isSelected && 'border-primary-700 bg-primary-200/20 text-primary-800',
      )}
    >
      {Icon && <Icon className='h-5 w-5' />}
      <div className='truncate'>{label}</div>
    </button>
  );
};
