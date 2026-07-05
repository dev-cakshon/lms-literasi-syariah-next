'use client';

import { Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { ApiError, updateQuiz } from '@/lib/api';
import { parseMoodleQuizXml } from '@/lib/quizXmlImport';
import { cn } from '@/lib/utils';

import { ImageUpload } from '@/components/course/admin/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { Quiz, QuizQuestion } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Creates a blank MC question with the required `question` field set to ''
 * (the legacy non-optional field on QuizQuestion) alongside `questionText`
 * which is the field the backend actually reads and students see.
 */
function emptyMcQuestion(): QuizQuestion {
  return {
    question: '',
    questionText: '',
    type: 'multipleChoice',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    points: 1,
  };
}

function emptyShortAnswerQuestion(): QuizQuestion {
  return {
    question: '',
    questionText: '',
    type: 'shortAnswer',
    options: [],
    correctAnswerText: '',
    points: 1,
  };
}

/**
 * Client-side validation — mirrors validateWordSearchGrid in ActivityEditForm.
 * Returns null when valid, or a human-readable Indonesian error string.
 *
 * Key constraints:
 *   - ≥1 question
 *   - Every questionText must be non-empty
 *   - MC: ≥2 non-empty options + correctAnswerIndex must point to a non-empty option
 *   - shortAnswer: correctAnswerText must be non-empty
 */
function validateQuiz(questions: QuizQuestion[]): string | null {
  if (questions.length === 0) {
    return 'Harus ada minimal 1 pertanyaan.';
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const label = `Pertanyaan ${i + 1}`;

    if (!q.questionText?.trim()) {
      return `${label}: teks pertanyaan tidak boleh kosong.`;
    }

    if (q.type === 'shortAnswer') {
      if (!q.correctAnswerText?.trim()) {
        return `${label}: jawaban benar tidak boleh kosong.`;
      }
    } else {
      // multipleChoice (or undefined — treat as MC)
      const opts = q.options ?? [];
      const filledCount = opts.filter((o) => o.trim() !== '').length;
      if (filledCount < 2) {
        return `${label}: minimal 2 pilihan harus diisi.`;
      }
      const idx = q.correctAnswerIndex ?? -1;
      if (idx < 0 || idx >= opts.length) {
        return `${label}: pilihan jawaban benar tidak valid.`;
      }
      if (!opts[idx]?.trim()) {
        return `${label}: pilihan yang dipilih sebagai benar tidak boleh kosong.`;
      }
    }
  }

  return null;
}

/**
 * Max obtainable points = sum of every question's points (default 1).
 * passingGrade is compared against pointsAwarded (raw points), so any
 * passingGrade above this sum is an impossible bar nobody can clear.
 */
function maxObtainablePoints(questions: QuizQuestion[]): number {
  return questions.reduce((sum, q) => sum + (q.points ?? 1), 0);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface QuizEditFormProps {
  courseId: string;
  quiz: Quiz;
  onQuizSaved: (updated: Quiz) => void;
}

export const QuizEditForm = ({
  courseId,
  quiz,
  onQuizSaved,
}: QuizEditFormProps) => {
  const [form, setForm] = useState<Quiz>(quiz);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [xmlImport, setXmlImport] = useState<{
    questions: QuizQuestion[];
    warnings: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resync when parent passes an updated quiz (e.g. after redirect or refresh)
  useEffect(() => {
    setForm(quiz);
    setSaved(false);
    setError(null);
  }, [quiz]);

  // Auto-clear the "Tersimpan" tick after 2s — mirrors ActivityEditForm
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  const maxPoints = maxObtainablePoints(form.questions);
  const passingGradeTooHigh = (form.passingGrade ?? 0) > maxPoints;

  const onSave = async () => {
    const validationError = validateQuiz(form.questions);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (passingGradeTooHigh) {
      setError(
        `Passing grade (${form.passingGrade}) melebihi total poin maksimum kuis ini (${maxPoints}) — tidak ada skor yang bisa lulus. Turunkan passing grade atau tambah poin pertanyaan.`,
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // ⚠️  Correctness crux: send questionText (not question) and
      // correctAnswerIndex (not correctAnswer). Both fail silently student-side.
      const updated = await updateQuiz(courseId, quiz.id, {
        title: form.title,
        questions: form.questions,
        type: form.type,
        gamificationType: form.gamificationType, // round-trip — no UI control
        passingGrade: form.passingGrade,
        allowRetake: form.allowRetake,
        showAnswers: form.showAnswers,
        timeLimitMinutes: form.timeLimitMinutes,
        scoringMode: form.scoringMode,
      });

      onQuizSaved(updated);
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal menyimpan perubahan kuis.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleXmlFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (ev) => {
      const xml = ev.target?.result as string;
      try {
        const result = parseMoodleQuizXml(xml);
        if (result.questions.length === 0) {
          setError('Tidak ada soal yang berhasil diimpor dari file XML.');
          return;
        }
        setXmlImport(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Gagal membaca file XML.',
        );
      }
    };
    reader.onerror = () => setError('Gagal membaca file.');
    reader.readAsText(file);
  };

  return (
    <div className='space-y-4'>
      {/* ── Sticky save status bar ── mirrors ActivityEditForm chrome */}
      <div className='sticky top-0 z-10 flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm'>
        <span className='text-sm font-semibold text-slate-700'>Edit Kuis</span>
        <span
          className={cn(
            'text-xs font-semibold',
            saving
              ? 'text-slate-400'
              : saved
                ? 'text-green-600'
                : error
                  ? 'text-red-500'
                  : 'text-slate-300',
          )}
        >
          {saving
            ? 'Menyimpan...'
            : saved
              ? '✓ Tersimpan'
              : error
                ? `Error: ${error}`
                : '—'}
        </span>
      </div>

      {/* ── Info Dasar ─────────────────────────────────────────────────────── */}
      <section className='space-y-4 rounded-lg border bg-white p-4'>
        <h2 className='border-l-4 border-primary-400 pl-2 text-xs font-bold uppercase tracking-wide text-slate-500'>
          Info Dasar
        </h2>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Judul Kuis</label>
          <Input
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder='Masukkan judul kuis'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Tipe Kuis</label>
          <div className='flex gap-4'>
            {(
              [
                ['preTest', 'Pre-Test'],
                ['postTest', 'Post-Test'],
                ['standard', 'Standar'],
              ] as const
            ).map(([val, label]) => (
              <label key={val} className='flex items-center gap-2 text-sm'>
                <input
                  type='radio'
                  checked={form.type === val}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      type: val as Quiz['type'],
                    }))
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Passing Grade (poin)</label>
          <div className='flex items-center gap-3'>
            <Input
              type='number'
              min={0}
              className={cn(
                'w-32',
                passingGradeTooHigh &&
                  'border-red-400 focus-visible:ring-red-400',
              )}
              value={form.passingGrade ?? 0}
              onChange={(e) => {
                const next = Number(e.target.value);
                setForm((prev) => ({
                  ...prev,
                  passingGrade: Number.isFinite(next) ? next : 0,
                }));
              }}
            />
            <span className='text-xs text-slate-500'>
              Maks. poin kuis ini: <strong>{maxPoints}</strong>
            </span>
          </div>
          {passingGradeTooHigh ? (
            <p className='text-xs font-medium text-red-600'>
              Passing grade melebihi total poin maksimum ({maxPoints}) — tidak
              ada skor yang bisa lulus. Turunkan nilainya atau tambah poin
              pertanyaan.
            </p>
          ) : (
            <p className='text-xs text-slate-500'>
              Minimum poin yang harus diraih siswa. Set ke 0 jika tidak ada
              batas kelulusan.
            </p>
          )}
        </div>

        <div className='flex flex-wrap gap-6'>
          <label className='flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              checked={form.allowRetake !== false}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, allowRetake: e.target.checked }))
              }
            />
            Izinkan Ulangi (allowRetake)
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              checked={form.showAnswers === true}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, showAnswers: e.target.checked }))
              }
            />
            Tampilkan Jawaban Setelah Kuis (showAnswers)
          </label>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>
            Waktu Pengerjaan (menit)
          </label>
          <div className='flex items-center gap-3'>
            <Input
              type='number'
              min={0}
              className='w-32'
              value={form.timeLimitMinutes ?? 0}
              onChange={(e) => {
                const next = Number(e.target.value);
                setForm((prev) => ({
                  ...prev,
                  timeLimitMinutes:
                    Number.isFinite(next) && next >= 0 ? next : 0,
                }));
              }}
            />
            <span className='text-xs text-slate-500'>
              0 = tidak ada batas waktu
            </span>
          </div>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Mode Penilaian</label>
          <div className='flex gap-4'>
            {(
              [
                ['standard', 'Standar'],
                ['penalty', 'Penalti'],
              ] as const
            ).map(([val, label]) => (
              <label key={val} className='flex items-center gap-2 text-sm'>
                <input
                  type='radio'
                  checked={(form.scoringMode ?? 'standard') === val}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      scoringMode: val as Quiz['scoringMode'],
                    }))
                  }
                />
                {label}
              </label>
            ))}
          </div>
          {(form.scoringMode ?? 'standard') === 'penalty' ? (
            <p className='text-xs text-slate-500'>
              Jawaban salah dikurangi 25% dari bobot soal (isian singkat tidak
              kena penalti); soal yang dikosongkan bernilai 0. Skor akhir tidak
              akan pernah negatif.
            </p>
          ) : (
            <p className='text-xs text-slate-500'>
              Jawaban salah bernilai 0 — tidak ada pengurangan skor.
            </p>
          )}
        </div>
      </section>

      {/* ── Pertanyaan ─────────────────────────────────────────────────────── */}
      <section className='space-y-4 rounded-lg border bg-white p-4'>
        <h2 className='border-l-4 border-primary-400 pl-2 text-xs font-bold uppercase tracking-wide text-slate-500'>
          Pertanyaan
        </h2>

        {form.questions.map((q, qIndex) => (
          <div key={qIndex} className='space-y-3 rounded-md bg-slate-50 p-3'>
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
                disabled={form.questions.length <= 1}
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
                        correctAnswerIndex:
                          questions[qIndex].correctAnswerIndex ?? 0,
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
                        correctAnswerText:
                          questions[qIndex].correctAnswerText ?? '',
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
                          const options = [
                            ...(questions[qIndex].options ?? []),
                          ];
                          options[oIndex] = value;
                          questions[qIndex] = {
                            ...questions[qIndex],
                            options,
                          };
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
                          const options = (
                            questions[qIndex].options ?? []
                          ).filter((_, i) => i !== oIndex);
                          // Keep correctAnswerIndex in-bounds
                          let correctIdx =
                            questions[qIndex].correctAnswerIndex ?? 0;
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
                        const options = [
                          ...(questions[qIndex].options ?? []),
                          '',
                        ];
                        questions[qIndex] = {
                          ...questions[qIndex],
                          options,
                        };
                        return { ...prev, questions };
                      });
                    }}
                  >
                    <Plus className='mr-1 h-3 w-3' />
                    Tambah Pilihan
                  </Button>
                )}
              </div>
            )}

            {/* Short-answer correct text */}
            {q.type === 'shortAnswer' && (
              <div className='space-y-1 pl-6'>
                <label className='text-xs text-slate-600'>Jawaban Benar</label>
                <Input
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
        ))}

        {/* Tambah Pertanyaan — defaults to MC */}
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              questions: [...prev.questions, emptyMcQuestion()],
            }))
          }
        >
          <Plus className='mr-1 h-4 w-4' />
          Tambah Pertanyaan (Pilihan Ganda)
        </Button>

        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              questions: [...prev.questions, emptyShortAnswerQuestion()],
            }))
          }
        >
          <Plus className='mr-1 h-4 w-4' />
          Tambah Pertanyaan (Isian Singkat)
        </Button>

        {/* ── XML Import ── */}
        <input
          ref={fileInputRef}
          type='file'
          accept='.xml,text/xml,application/xml'
          className='hidden'
          onChange={handleXmlFile}
        />
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className='mr-1 h-4 w-4' />
          Import Soal (XML)
        </Button>

        {/* ── Import preview banner ── */}
        {xmlImport && (
          <div className='rounded-md border border-primary-200 bg-primary-50 p-3 text-sm'>
            <p className='font-medium text-primary-800'>
              {xmlImport.questions.length} soal siap diimpor
              {xmlImport.warnings.length > 0 &&
                ` · ${xmlImport.warnings.length} peringatan`}
            </p>
            {xmlImport.warnings.length > 0 && (
              <ul className='mt-1 list-inside list-disc space-y-0.5 text-xs text-amber-700'>
                {xmlImport.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            )}
            <div className='mt-3 flex gap-2'>
              <Button
                type='button'
                size='sm'
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    questions: [...prev.questions, ...xmlImport.questions],
                  }));
                  setXmlImport(null);
                }}
              >
                Tambahkan
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    questions: xmlImport.questions,
                  }));
                  setXmlImport(null);
                }}
              >
                Ganti Semua
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setXmlImport(null)}
              >
                Batal
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ── Save ────────────────────────────────────────────────────────────── */}
      <div className='flex items-center gap-3'>
        <Button type='button' onClick={onSave} disabled={saving}>
          {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
};
