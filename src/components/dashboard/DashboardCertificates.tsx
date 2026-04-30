'use client';

import { useEffect, useState } from 'react';

import { getMyAllCertificates } from '@/lib/api';

import CertificateViewModal from './CertificateViewModal';

import type { Certificate } from '@/types';

export function DashboardCertificates() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);

  useEffect(() => {
    getMyAllCertificates()
      .then(setCertificates)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className='bg-white/60 rounded-2xl p-6 lg:p-8'>
      <h2 className='text-xl font-bold text-gray-800 mb-4'>Sertifikat Saya</h2>

      {loading && <p className='text-gray-500 text-sm'>Memuat sertifikat...</p>}

      {!loading && error && (
        <p className='text-red-500 text-sm'>Gagal memuat sertifikat.</p>
      )}

      {!loading && !error && certificates.length === 0 && (
        <p className='text-gray-500 text-sm'>
          Belum ada sertifikat — selesaikan kursus untuk mendapatkan sertifikat.
        </p>
      )}

      {!loading && !error && certificates.length > 0 && (
        <div className='flex gap-4 overflow-x-auto pb-2'>
          {certificates.map((cert) => (
            <button
              key={cert.id}
              onClick={() => setSelectedCertificate(cert)}
              className='flex-none w-56 text-left rounded-xl overflow-hidden border border-gray-200 hover:border-primary-400 hover:shadow-md transition-all bg-white'
            >
              <div
                className='w-full overflow-hidden'
                style={{ aspectRatio: '3508 / 2480' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src='/assets/certificate-template.jpg'
                  alt={`Sertifikat ${cert.courseName}`}
                  className='w-full h-full object-cover'
                />
              </div>
              <div className='p-3'>
                <p className='text-sm font-semibold text-gray-800 line-clamp-2 leading-snug'>
                  {cert.courseName}
                </p>
                <p className='text-xs text-gray-500 mt-1'>
                  {new Intl.DateTimeFormat('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }).format(new Date(cert.completionDate))}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedCertificate && (
        <CertificateViewModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </section>
  );
}
