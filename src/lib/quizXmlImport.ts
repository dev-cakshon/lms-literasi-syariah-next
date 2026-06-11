import type { QuizQuestion } from '@/types';

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function parseMoodleQuizXml(xml: string): {
  questions: QuizQuestion[];
  warnings: string[];
} {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(
      `XML tidak valid: ${parseError.textContent?.slice(0, 120) ?? 'parse error'}`,
    );
  }

  const questions: QuizQuestion[] = [];
  const warnings: string[] = [];
  let questionNumber = 0;

  doc.querySelectorAll('question').forEach((el) => {
    const type = el.getAttribute('type') ?? '';
    questionNumber++;

    if (type === 'category' || type === 'description') {
      warnings.push(`Pertanyaan ${questionNumber}: tipe "${type}" dilewati.`);
      return;
    }

    if (type !== 'multichoice' && type !== 'shortanswer') {
      warnings.push(
        `Pertanyaan ${questionNumber}: tipe "${type}" tidak didukung, dilewati.`,
      );
      return;
    }

    const rawHtml = el.querySelector('questiontext text')?.textContent ?? '';
    const questionText = stripHtml(rawHtml);

    if (rawHtml.includes('<img') || el.querySelector('file')) {
      warnings.push(
        `Pertanyaan ${questionNumber}: gambar tertanam tidak diimpor — unggah manual via pemilih gambar.`,
      );
    }

    const defaultGradeText =
      el.querySelector('defaultgrade')?.textContent ?? '1';
    const points = parseFloat(defaultGradeText);
    const safePoints = Number.isFinite(points) && points > 0 ? points : 1;

    if (type === 'multichoice') {
      const answerEls = Array.from(el.querySelectorAll('answer'));
      const options = answerEls.map((a) =>
        stripHtml(a.querySelector('text')?.textContent ?? ''),
      );
      const correctIdx = answerEls.findIndex(
        (a) => parseFloat(a.getAttribute('fraction') ?? '0') >= 100,
      );

      const singleText = el
        .querySelector('single')
        ?.textContent?.trim()
        .toLowerCase();
      if (singleText === 'false') {
        warnings.push(
          `Pertanyaan ${questionNumber}: multi-jawaban tidak didukung — mengambil jawaban benar pertama.`,
        );
      }

      questions.push({
        question: '',
        questionText,
        type: 'multipleChoice',
        options,
        correctAnswerIndex: correctIdx >= 0 ? correctIdx : 0,
        points: safePoints,
      });
    } else {
      const firstCorrect = Array.from(el.querySelectorAll('answer')).find(
        (a) => parseFloat(a.getAttribute('fraction') ?? '0') >= 100,
      );
      const correctAnswerText = stripHtml(
        firstCorrect?.querySelector('text')?.textContent ?? '',
      );

      questions.push({
        question: '',
        questionText,
        type: 'shortAnswer',
        options: [],
        correctAnswerText,
        points: safePoints,
      });
    }
  });

  return { questions, warnings };
}
