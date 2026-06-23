'use client';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ShortAnswerInputProps {
  /** The question prompt text (already normalized by the container). */
  questionText: string;
  currentQuestion: number;
  totalQuestions: number;
  value: string;
  onChangeValue: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isLastQuestion: boolean;
  answeredCount: number;
  isSubmitting?: boolean;
  /** When true, the Submit button is visually disabled (all answers must be filled). */
  submitDisabled?: boolean;
  imageUrl?: string;
}

export const ShortAnswerInput = ({
  questionText,
  currentQuestion,
  totalQuestions,
  value,
  onChangeValue,
  onNext,
  onPrevious,
  onSubmit,
  isLastQuestion,
  answeredCount,
  isSubmitting = false,
  submitDisabled = false,
  imageUrl,
}: ShortAnswerInputProps) => {
  const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className='flex flex-col items-center justify-center p-6'>
      <div className='max-w-4xl w-full p-8'>
        {/* Progress — mirrors MultipleAnswer */}
        <div className='mb-6'>
          <div className='flex justify-between text-sm text-gray-600 mb-2'>
            <span className='font-bold'>
              Question {currentQuestion + 1}/{totalQuestions}
            </span>
            <span>{answeredCount} terjawab</span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-primary-500 h-2 rounded-full transition-all'
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {imageUrl && (
          <div className='relative w-full aspect-video max-w-lg mb-4 rounded-md overflow-hidden bg-slate-100'>
            <Image
              src={imageUrl}
              alt='Gambar soal'
              fill
              sizes='(max-width: 512px) 100vw, 512px'
              className='object-contain'
            />
          </div>
        )}

        {/* Question */}
        <h2 className='text-2xl font-bold mb-4 text-primary-900'>
          {questionText}
        </h2>

        <p className='text-sm text-gray-500 mb-6'>
          Ketikkan jawaban Anda di bawah ini.
        </p>

        {/* Text input */}
        <Input
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          placeholder='Jawaban Anda...'
          className='mb-8 text-base'
          disabled={isSubmitting}
        />

        {/* Navigation — mirrors MultipleAnswer */}
        <div className='flex justify-between items-center'>
          <Button
            onClick={onPrevious}
            disabled={currentQuestion === 0}
            variant='outline'
          >
            Sebelumnya
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={onSubmit}
              disabled={isSubmitting || submitDisabled}
              variant='default'
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button onClick={onNext} variant='default'>
              Next Question
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
