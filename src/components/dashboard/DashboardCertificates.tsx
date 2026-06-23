'use client';

import { Award, BookOpen, Calendar } from 'lucide-react';
import { useState } from 'react';

import { useMyCertificates } from '@/hooks/use-certificates';

import CertificateViewModal from './CertificateViewModal';

import type { Certificate } from '@/types';

interface CertificateTileProps {
  cert: Certificate;
  index: number;
  onClick: () => void;
}

function CertificateTile({ cert, index, onClick }: CertificateTileProps) {
  const isEven = index % 2 === 0;

  const headerGradient = isEven
    ? 'bg-gradient-to-r from-[var(--color-emerald-deep)] to-[var(--color-primary-500)]'
    : 'bg-gradient-to-r from-[#F57F17] to-[#FFB74D]';

  const stripeClass = isEven ? 'cert-stripe-r' : 'cert-stripe-l';

  const iconColor = isEven
    ? 'text-[var(--color-emerald-deep)]'
    : 'text-[#F57F17]';

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(cert.completionDate));

  return (
    <button
      type='button'
      onClick={onClick}
      className='bg-[var(--color-surface-container-low)] rounded-2xl border border-[var(--color-outline-variant)]/30 overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative cursor-pointer text-left w-full'
    >
      <div className={`h-20 relative ${headerGradient}`}>
        <div className={`absolute inset-0 opacity-20 ${stripeClass}`} />
        <Award className='absolute right-3 top-3 text-white/40 size-12' />
      </div>

      <div className='p-5 pt-8 relative bg-white'>
        <div className='absolute -top-7 left-5 w-14 h-14 bg-white rounded-2xl p-1 border border-[var(--color-outline-variant)] shadow-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform'>
          <BookOpen className={`size-7 ${iconColor}`} />
        </div>

        <h3 className='font-bold text-[var(--color-on-surface)] text-base mb-1 line-clamp-2'>
          {cert.courseName}
        </h3>

        <p className='text-xs text-[var(--color-on-surface-soft)] flex items-center gap-1.5 mt-2 font-semibold'>
          <Calendar className='size-4 shrink-0' />
          {formattedDate}
        </p>
      </div>
    </button>
  );
}

export function DashboardCertificates() {
  const { certificates, loading, error } = useMyCertificates();
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);

  const openModal = (cert: Certificate) => setSelectedCertificate(cert);

  return (
    <section className='bg-white rounded-[2rem] shadow-xl border border-[var(--color-surface-container-low)] overflow-hidden flex flex-col'>
      <div className='p-5 lg:p-6 border-b border-[var(--color-surface-container-low)] flex items-center justify-between bg-white'>
        <h2 className='text-xl font-bold text-[var(--color-on-surface)]'>
          🎓 Sertifikat Saya
        </h2>
        {certificates.length > 0 && (
          <button
            type='button'
            onClick={() => openModal(certificates[0])}
            className='text-xs font-bold uppercase tracking-wider text-[var(--color-emerald-deep)] hover:underline decoration-[var(--color-accent-lime-ink)] decoration-2 underline-offset-4 transition-all'
          >
            Lihat Semua →
          </button>
        )}
      </div>

      <div className='p-5 lg:p-6 bg-white flex-grow'>
        {loading && (
          <p className='text-gray-500 text-sm'>Memuat sertifikat...</p>
        )}

        {!loading && error && (
          <p className='text-red-500 text-sm'>Gagal memuat sertifikat.</p>
        )}

        {!loading && !error && certificates.length === 0 && (
          <p className='text-gray-500 text-sm'>
            Belum ada sertifikat — selesaikan kursus untuk mendapatkan
            sertifikat.
          </p>
        )}

        {!loading && !error && certificates.length > 0 && (
          <div className='grid grid-cols-1 gap-4'>
            {certificates.slice(0, 3).map((cert, index) => (
              <CertificateTile
                key={cert.id}
                cert={cert}
                index={index}
                onClick={() => openModal(cert)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedCertificate && (
        <CertificateViewModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </section>
  );
}
