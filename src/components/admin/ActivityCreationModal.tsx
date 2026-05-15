'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { createActivity } from '@/lib/api';

import {
  type DragDropFormData,
  DragDropForm,
} from '@/components/admin/activity-forms/DragDropForm';
import {
  type TrueOrFalseFormData,
  TrueOrFalseForm,
} from '@/components/admin/activity-forms/TrueOrFalseForm';
import {
  type WordSearchFormData,
  WordSearchForm,
} from '@/components/admin/activity-forms/WordSearchForm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import type {
  AdminActivity,
  DragDropActivity,
  TrueOrFalseActivity,
  WordSearchActivity,
} from '@/types';

type ActivityType = 'drag-drop' | 'word-search' | 'true-or-false';

interface ActivityCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  onActivityCreated: () => void;
}

const ACTIVITY_TYPES: Array<{
  value: ActivityType;
  title: string;
  description: string;
}> = [
  {
    value: 'drag-drop',
    title: 'Drag & Drop',
    description: 'Buat aktivitas menyusun item dengan interaksi drag and drop.',
  },
  {
    value: 'word-search',
    title: 'Word Search',
    description:
      'Buat teka-teki pencarian kata untuk melatih pemahaman istilah.',
  },
  {
    value: 'true-or-false',
    title: 'True or False',
    description: 'Buat aktivitas benar/salah dengan umpan balik langsung.',
  },
];

export const ActivityCreationModal = ({
  isOpen,
  onClose,
  courseId,
  onActivityCreated,
}: ActivityCreationModalProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [formData, setFormData] = useState<
    DragDropFormData | WordSearchFormData | TrueOrFalseFormData | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedType(null);
      setFormData(null);
      setSaving(false);
      setSaveError(null);
    }
  }, [isOpen]);

  const handleClose = () => {
    setStep(1);
    setSelectedType(null);
    setFormData(null);
    setSaving(false);
    setSaveError(null);
    onClose();
  };

  const handleSave = async () => {
    if (!selectedType || !formData) return;

    try {
      setSaving(true);
      setSaveError(null);

      let payload: Omit<AdminActivity, 'id' | 'createdAt' | 'updatedAt'>;

      if (selectedType === 'drag-drop') {
        const data = formData as DragDropFormData;
        const dragDropPayload: Omit<
          DragDropActivity,
          'id' | 'createdAt' | 'updatedAt'
        > = {
          type: 'drag_drop',
          title: data.title,
          position: 0,
          maxPoints: data.maxPoints,
          categories: data.categories.map((category) => category.name),
          items: data.items.map((item) => ({
            id: '',
            label: item.label,
            correctCategory: data.categories[item.categoryIndex]?.name ?? '',
          })),
          feedbackMode: data.feedbackMode,
        };
        payload = dragDropPayload;
      } else if (selectedType === 'word-search') {
        const data = formData as WordSearchFormData;
        const wordSearchPayload: Omit<
          WordSearchActivity,
          'id' | 'createdAt' | 'updatedAt'
        > = {
          type: 'word_search',
          title: data.title,
          position: 0,
          maxPoints: data.maxPoints,
          wordList: data.wordList.map((word) => word.word),
          gridSize: data.gridSize,
        };
        payload = wordSearchPayload;
      } else {
        const data = formData as TrueOrFalseFormData;
        const trueOrFalsePayload: Omit<
          TrueOrFalseActivity,
          'id' | 'createdAt' | 'updatedAt'
        > = {
          type: 'true_or_false',
          title: data.title,
          position: 0,
          maxPoints: data.maxPoints,
          statements: data.statements.map((statement, index) => ({
            id: `tof_${Date.now()}_${index}`,
            text: statement.text,
            correct: statement.isTrue,
          })),
          feedbackMode: data.feedbackMode,
        };
        payload = trueOrFalsePayload;
      }

      await createActivity(courseId, payload);
      onActivityCreated();
      handleClose();
    } catch (err) {
      if (err instanceof Error && err.message) {
        setSaveError(err.message);
      } else {
        setSaveError('Gagal menyimpan aktivitas. Silakan coba lagi.');
      }
    } finally {
      setSaving(false);
    }
  };

  const selectedTypeLabel =
    selectedType === 'drag-drop'
      ? 'Drag & Drop'
      : selectedType === 'word-search'
        ? 'Word Search'
        : selectedType === 'true-or-false'
          ? 'True or False'
          : '-';

  if (!isOpen) {
    return null;
  }

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4'>
      <div className='w-full max-w-3xl rounded-lg border bg-white shadow-xl'>
        <div className='flex items-center justify-between border-b px-6 py-4'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>
              Tambah Aktivitas
            </h2>
            <p className='text-sm text-muted-foreground'>Step {step} dari 3</p>
          </div>
          <button
            onClick={handleClose}
            className='rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            aria-label='Tutup modal'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        <div className='p-6'>
          {step === 1 ? (
            <div className='space-y-6'>
              <div>
                <h3 className='text-base font-semibold text-slate-900'>
                  Pilih Jenis Aktivitas
                </h3>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Pilih tipe aktivitas yang ingin Anda tambahkan ke kursus.
                </p>
              </div>

              <div className='grid gap-4 md:grid-cols-3'>
                {ACTIVITY_TYPES.map((activityType) => {
                  const isSelected = selectedType === activityType.value;

                  return (
                    <button
                      key={activityType.value}
                      onClick={() => setSelectedType(activityType.value)}
                      className='text-left'
                      type='button'
                    >
                      <Card
                        className={
                          isSelected
                            ? 'border-primary-500 ring-2 ring-primary-200'
                            : 'hover:border-slate-300'
                        }
                      >
                        <CardHeader>
                          <CardTitle className='text-base'>
                            {activityType.title}
                          </CardTitle>
                          <CardDescription>
                            {activityType.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <span className='text-xs font-medium text-primary-700'>
                            {isSelected ? 'Terpilih' : 'Pilih tipe ini'}
                          </span>
                        </CardContent>
                      </Card>
                    </button>
                  );
                })}
              </div>

              <div className='flex items-center justify-end gap-2 border-t pt-4'>
                <Button variant='outline' onClick={handleClose}>
                  Batal
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={selectedType === null}
                >
                  Selanjutnya →
                </Button>
              </div>
            </div>
          ) : step === 2 ? (
            <>
              {selectedType === 'drag-drop' ? (
                <DragDropForm
                  onBack={() => setStep(1)}
                  onNext={(data) => {
                    setFormData(data);
                    setSaveError(null);
                    setStep(3);
                  }}
                />
              ) : selectedType === 'word-search' ? (
                <WordSearchForm
                  onBack={() => setStep(1)}
                  onNext={(data) => {
                    setFormData(data);
                    setSaveError(null);
                    setStep(3);
                  }}
                />
              ) : selectedType === 'true-or-false' ? (
                <TrueOrFalseForm
                  onBack={() => setStep(1)}
                  onNext={(data) => {
                    setFormData(data);
                    setSaveError(null);
                    setStep(3);
                  }}
                />
              ) : (
                <div className='space-y-4 p-8 text-center text-muted-foreground'>
                  <p>Tipe aktivitas belum dipilih.</p>
                  <Button variant='outline' onClick={() => setStep(1)}>
                    Kembali
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className='space-y-6'>
              {!formData ? (
                <div className='space-y-4 p-8 text-center text-muted-foreground'>
                  <p>Data tidak ditemukan, kembali ke langkah sebelumnya.</p>
                  <Button variant='outline' onClick={() => setStep(2)}>
                    Kembali
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className='text-base font-semibold text-slate-900'>
                      Konfirmasi Aktivitas
                    </h3>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      Periksa ringkasan sebelum menyimpan aktivitas baru.
                    </p>
                  </div>

                  <div className='rounded-md border p-4 space-y-2 text-sm'>
                    <p>
                      <span className='font-medium text-slate-700'>Tipe:</span>{' '}
                      {selectedTypeLabel}
                    </p>
                    <p>
                      <span className='font-medium text-slate-700'>Judul:</span>{' '}
                      {formData.title}
                    </p>
                    <p>
                      <span className='font-medium text-slate-700'>
                        Max Points:
                      </span>{' '}
                      {formData.maxPoints}
                    </p>
                  </div>

                  {saveError && (
                    <p className='text-sm text-red-600'>{saveError}</p>
                  )}

                  <div className='flex items-center justify-end gap-2 border-t pt-4'>
                    <Button variant='outline' onClick={() => setStep(2)}>
                      Kembali
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export type { ActivityCreationModalProps, ActivityType };
