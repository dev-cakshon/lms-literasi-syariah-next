'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { QuizOption } from './QuizOption';

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  imageUrl?: string;
}

interface MultipleAnswerProps {
  question: Question;
  currentQuestion: number;
  totalQuestions: number;
  selectedAnswer: number;
  onSelectAnswer: (answerIndex: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isLastQuestion: boolean;
  answeredCount: number;
  isSubmitting?: boolean;
  /** When true, the Submit button is visually disabled (all answers must be filled). */
  submitDisabled?: boolean;
  imageUrl?: string;
  /** PRD21 — penalty-mode-only: shows a "Lewati Soal" control to deselect the current answer. */
  allowSkip?: boolean;
  /** Called when the student deselects their answer via "Lewati Soal". */
  onSkip?: () => void;
}

export const MultipleAnswer = ({
  question,
  currentQuestion,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onNext,
  onPrevious,
  onSubmit,
  isLastQuestion,
  answeredCount,
  isSubmitting = false,
  submitDisabled = false,
  imageUrl,
  allowSkip = false,
  onSkip,
}: MultipleAnswerProps) => {
  const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className='flex flex-col items-center justify-center p-6'>
      <div className='max-w-4xl w-full p-8'>
        {/* Progress */}
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
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>
        </div>

        {imageUrl && (
          <div className='relative w-full aspect-video max-w-lg mb-4 rounded-md overflow-hidden bg-slate-100'>
            <Image
              src={imageUrl}
              alt='Gambar soal'
              fill
              className='object-contain'
            />
          </div>
        )}

        {/* Question */}
        <h2 className='text-2xl font-bold mb-8 text-primary-900'>
          {question.question}
        </h2>

        {/* Options */}
        <div className={cn('space-y-3', allowSkip ? 'mb-4' : 'mb-8')}>
          {question.options.map((option, index) => (
            <QuizOption
              key={index}
              option={option}
              index={index}
              isSelected={selectedAnswer === index}
              onSelect={() => onSelectAnswer(index)}
            />
          ))}
        </div>

        {/* Skip control — penalty mode only (US-4): leaving a question blank
            is the safe move, so it needs to be as easy as picking an option. */}
        {allowSkip && (
          <div className='mb-8'>
            <Button
              type='button'
              onClick={onSkip}
              disabled={selectedAnswer === -1}
              variant='outline'
              size='sm'
            >
              Lewati Soal
            </Button>
          </div>
        )}

        {/* Navigation */}
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
