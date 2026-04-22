'use client';

import { Button } from '@/components/ui/button';

interface QuizOptionProps {
  option: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const QuizOption = ({
  option,
  index,
  isSelected,
  onSelect,
}: QuizOptionProps) => {
  return (
    <Button
      onClick={onSelect}
      variant='outline'
      className={`h-auto w-full justify-start rounded-xl p-4 text-left ${
        isSelected
          ? 'bg-primary-50 border-primary-500'
          : 'hover:bg-white hover:border-primary-400'
      }`}
    >
      <span
        className={`font-bold ${
          isSelected ? 'text-primary-700' : 'text-gray-700'
        }`}
      >
        {String.fromCharCode(65 + index)}.
      </span>
      &nbsp;
      <span
        className={isSelected ? 'font-bold text-primary-700' : 'text-gray-700'}
      >
        {option}
      </span>
    </Button>
  );
};
