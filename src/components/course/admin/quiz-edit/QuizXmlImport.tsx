'use client';

import { Upload } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { useRef, useState } from 'react';

import { parseMoodleQuizXml } from '@/lib/quizXmlImport';

import { Button } from '@/components/ui/button';

import type { Quiz, QuizQuestion } from '@/types';

interface QuizXmlImportProps {
  setForm: Dispatch<SetStateAction<Quiz>>;
  onError: (message: string | null) => void;
}

export function QuizXmlImport({ setForm, onError }: QuizXmlImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [xmlImport, setXmlImport] = useState<{
    questions: QuizQuestion[];
    warnings: string[];
  } | null>(null);

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
          onError('Tidak ada soal yang berhasil diimpor dari file XML.');
          return;
        }
        setXmlImport(result);
        onError(null);
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Gagal membaca file XML.');
      }
    };
    reader.onerror = () => onError('Gagal membaca file.');
    reader.readAsText(file);
  };

  return (
    <>
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

      {/* Import preview banner */}
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
    </>
  );
}
