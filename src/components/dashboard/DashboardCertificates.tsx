'use client';

import { useEffect, useState } from 'react';

import { getMyAllCertificates } from '@/lib/api';

import CertificateViewModal from './CertificateViewModal';

import type { Certificate } from '@/types';

interface CertificateTileProps {
  cert: Certificate;
  index: number;
  onClick: () => void;
}

function CertificateTile({ cert, index, onClick }: CertificateTileProps) {
  const gradient =
    index % 2 === 0
      ? 'bg-gradient-to-r from-[#1e5548] to-[#3a9478]'
      : 'bg-gradient-to-r from-[#b35e00] to-[#FF9800]';

  return (
    <button onClick={onClick} className='text-left w-full'>
      <div className={`relative h-20 w-full rounded-lg ${gradient}`}>
        <span className='absolute bottom-1.5 right-2 bg-white/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded'>
          SERTIFIKAT
        </span>
      </div>
      <div className='mt-1.5'>
        <p className='text-sm font-bold text-ink line-clamp-2'>
          {cert.courseName}
        </p>
        <p className='text-xs text-muted'>
          {new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }).format(new Date(cert.completionDate))}
        </p>
      </div>
    </button>
  );
}

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

  const openModal = (cert: Certificate) => setSelectedCertificate(cert);

  return (
    <div className='bg-white rounded-2xl p-5 border border-primary-100 shadow-elevated-1'>
      <div className='flex items-center justify-between mb-3'>
        <h2 className='text-xl font-bold text-gray-800'>🎓 Sertifikat Saya</h2>
        {certificates.length > 0 && (
          <button
            onClick={() => openModal(certificates[0])}
            className='text-xs font-semibold text-primary-500 bg-[#D9EDBF] px-3 py-1 rounded-full'
          >
            Lihat semua →
          </button>
        )}
      </div>

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
        <div className='grid grid-cols-2 gap-3'>
          {certificates.slice(0, 4).map((cert, index) => (
            <CertificateTile
              key={cert.id}
              cert={cert}
              index={index}
              onClick={() => openModal(cert)}
            />
          ))}
        </div>
      )}

      {selectedCertificate && (
        <CertificateViewModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
}
