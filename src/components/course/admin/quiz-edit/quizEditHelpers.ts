import type { Quiz, QuizQuestion } from '@/types';

// ─── Factories ────────────────────────────────────────────────────────────────

/**
 * Creates a blank MC question with the required `question` field set to ''
 * (the legacy non-optional field on QuizQuestion) alongside `questionText`
 * which is the field the backend actually reads and students see.
 */
export function emptyMcQuestion(): QuizQuestion {
  return {
    question: '',
    questionText: '',
    type: 'multipleChoice',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    points: 1,
  };
}

export function emptyShortAnswerQuestion(): QuizQuestion {
  return {
    question: '',
    questionText: '',
    type: 'shortAnswer',
    options: [],
    correctAnswerText: '',
    points: 1,
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

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
export function validateQuiz(questions: QuizQuestion[]): string | null {
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

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Max obtainable points = sum of every question's points (default 1).
 * passingGrade is compared against pointsAwarded (raw points), so any
 * passingGrade above this sum is an impossible bar nobody can clear.
 */
export function maxObtainablePoints(questions: Quiz['questions']): number {
  return questions.reduce((sum, q) => sum + (q.points ?? 1), 0);
}
