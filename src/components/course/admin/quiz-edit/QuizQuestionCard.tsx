'use client';

import { Trash2 } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

import { ImageUpload } from '@/components/course/admin/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { Quiz, QuizQuestion } from '@/types';

interface QuizQuestionCardProps {
  question: QuizQuestion;
  index: number;
  setForm: Dispatch<SetStateAction<Quiz>>;
  disableDelete: boolean;
}

export function QuizQuestionCard({
  question: q,
  index: qIndex,
  setForm,
  disableDelete,
}: QuizQuestionCardProps) {
  return (
    <div className='space-y-3 rounded-md bg-slate-50 p-3'>
      {/* Question text + delete row */}
      <div className='flex items-start gap-2'>
        <span className='mt-2.5 w-4 shrink-0 text-xs text-slate-400'>
          {qIndex + 1}
        </span>
        <Input
          value={q.questionText ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            setForm((prev) => {
              const questions = [...prev.questions];
              // Write questionText — backend reads only this field.
              questions[qIndex] = {
                ...questions[qIndex],
                questionText: value,
              };
              return { ...prev, questions };
            });
          }}
          placeholder={`Teks pertanyaan ${qIndex + 1}`}
        />
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => {
            setForm((prev) => {
              if (prev.questions.length <= 1) return prev;
              return {
                ...prev,
                questions: prev.questions.filter((_, i) => i !== qIndex),
              };
            });
          }}
          disabled={disableDelete}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      {/* Question image (optional) */}
      <div className='pl-6'>
        <ImageUpload
          folder='thumbnails/quizzes'
          value={q.imageUrl ?? ''}
          onChange={(url) =>
            setForm((prev) => {
              const questions = [...prev.questions];
              questions[qIndex] = { ...questions[qIndex], imageUrl: url };
              return { ...prev, questions };
            })
          }
        />
      </div>

      {/* Type toggle + points */}
      <div className='flex flex-wrap items-center gap-4 pl-6'>
        <label className='flex items-center gap-2 text-xs'>
          <input
            type='radio'
            checked={q.type !== 'shortAnswer'}
            onChange={() => {
              setForm((prev) => {
                const questions = [...prev.questions];
                questions[qIndex] = {
                  ...questions[qIndex],
                  type: 'multipleChoice',
                  options: questions[qIndex].options?.length
                    ? questions[qIndex].options
                    : ['', '', '', ''],
                  correctAnswerIndex: questions[qIndex].correctAnswerIndex ?? 0,
                };
                return { ...prev, questions };
              });
            }}
          />
          Pilihan Ganda
        </label>
        <label className='flex items-center gap-2 text-xs'>
          <input
            type='radio'
            checked={q.type === 'shortAnswer'}
            onChange={() => {
              setForm((prev) => {
                const questions = [...prev.questions];
                questions[qIndex] = {
                  ...questions[qIndex],
                  type: 'shortAnswer',
                  correctAnswerText: questions[qIndex].correctAnswerText ?? '',
                };
                return { ...prev, questions };
              });
            }}
          />
          Isian Singkat
        </label>

        <span className='ml-auto flex items-center gap-2 text-xs text-slate-600'>
          Poin:
          <Input
            type='number'
            min={1}
            className='h-7 w-20 text-xs'
            value={q.points ?? 1}
            onChange={(e) => {
              const val = Number(e.target.value);
              setForm((prev) => {
                const questions = [...prev.questions];
                questions[qIndex] = {
                  ...questions[qIndex],
                  points: Number.isFinite(val) && val >= 1 ? val : 1,
                };
                return { ...prev, questions };
              });
            }}
          />
        </span>
      </div>

      {/* MC options */}
      {q.type !== 'shortAnswer' && (
        <div className='space-y-2 pl-6'>
          {(q.options ?? []).map((opt, oIndex) => (
            <div key={oIndex} className='flex items-center gap-2'>
              {/* Radio selects the correct answer index */}
              <input
                type='radio'
                name={`correct-${qIndex}`}
                checked={q.correctAnswerIndex === oIndex}
                onChange={() => {
                  setForm((prev) => {
                    const questions = [...prev.questions];
                    // Write correctAnswerIndex — grader reads this field.
                    questions[qIndex] = {
                      ...questions[qIndex],
                      correctAnswerIndex: oIndex,
                    };
                    return { ...prev, questions };
                  });
                }}
              />
              <Input
                value={opt}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => {
                    const questions = [...prev.questions];
                    const options = [...(questions[qIndex].options ?? [])];
                    options[oIndex] = value;
                    questions[qIndex] = { ...questions[qIndex], options };
                    return { ...prev, questions };
                  });
                }}
                placeholder={`Pilihan ${oIndex + 1}`}
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  setForm((prev) => {
                    const questions = [...prev.questions];
                    const options = (questions[qIndex].options ?? []).filter(
                      (_, i) => i !== oIndex,
                    );
                    // Keep correctAnswerIndex in-bounds
                    let correctIdx = questions[qIndex].correctAnswerIndex ?? 0;
                    if (correctIdx >= options.length) {
                      correctIdx = Math.max(0, options.length - 1);
                    }
                    questions[qIndex] = {
                      ...questions[qIndex],
                      options,
                      correctAnswerIndex: correctIdx,
                    };
                    return { ...prev, questions };
                  });
                }}
                disabled={(q.options ?? []).length <= 2}
              >
                <Trash2 className='h-3 w-3' />
              </Button>
            </div>
          ))}

          {(q.options ?? []).length < 5 && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => {
                setForm((prev) => {
                  const questions = [...prev.questions];
                  const options = [...(questions[qIndex].options ?? ''), ''];
                  questions[qIndex] = { ...questions[qIndex], options };
                  return { ...prev, questions };
                });
              }}
            >
              Tambah Pilihan
            </Button>
          )}
        </div>
      )}

      {/* Short-answer correct text */}
      {q.type === 'shortAnswer' && (
        <div className='space-y-1 pl-6'>
          <label
            htmlFor={`correct-answer-${qIndex}`}
            className='text-xs text-slate-600'
          >
            Jawaban Benar
          </label>
          <Input
            id={`correct-answer-${qIndex}`}
            value={q.correctAnswerText ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              setForm((prev) => {
                const questions = [...prev.questions];
                // Write correctAnswerText — grader reads this for SA.
                questions[qIndex] = {
                  ...questions[qIndex],
                  correctAnswerText: value,
                };
                return { ...prev, questions };
              });
            }}
            placeholder='Ketik jawaban yang diterima (case-insensitive, trimmed)'
          />
        </div>
      )}
    </div>
  );
}
