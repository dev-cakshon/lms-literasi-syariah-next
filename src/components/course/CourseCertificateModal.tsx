'use client';

import { useContext, useEffect, useRef, useState } from 'react';

import { CourseLayoutContext } from '@/app/(main)/(student)/(course)/course/[courseId]/CourseLayoutContext';

import type { Certificate } from '@/types';

interface Props {
  certificate: Certificate;
  onClose: () => void;
}

export default function CourseCertificateModal({
  certificate,
  onClose,
}: Props) {
  const { setChatFabHidden } = useContext(CourseLayoutContext);
  const [phase, setPhase] = useState<1 | 2>(1);
  const [downloadError, setDownloadError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChatFabHidden(true);
    return () => setChatFabHidden(false);
  }, [setChatFabHidden]);

  useEffect(() => {
    const t = setTimeout(() => setPhase(2), 1500);
    return () => clearTimeout(t);
  }, []);

  const handleDownload = async () => {
    setDownloadError(false);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');
      if (!cardRef.current) return;

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
      pdf.save(`sertifikat-${certificate.courseName}.pdf`);
    } catch {
      setDownloadError(true);
    }
  };

  return (
    <>
      <style>{`
        @keyframes certFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes certGlow {
          0%   { box-shadow: 0 0 0 0   rgba(74, 168, 94, 0.8); }
          60%  { box-shadow: 0 0 0 72px rgba(74, 168, 94, 0);   }
          100% { box-shadow: 0 0 0 0   rgba(74, 168, 94, 0);   }
        }
        @keyframes certBurst {
          0%   { transform: scale(0.65); opacity: 0; }
          55%  { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes certSlideUp {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      <div
        className='fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4'
        style={{ animation: 'certFadeIn 0.4s ease both' }}
      >
        {phase === 1 && (
          <div
            className='flex flex-col items-center gap-8 text-center'
            style={{ animation: 'certBurst 0.55s ease both' }}
          >
            <div
              className='w-28 h-28 rounded-full bg-green-400'
              style={{ animation: 'certGlow 1.1s ease-out infinite' }}
            />
            <h1 className='text-3xl md:text-4xl font-bold text-white max-w-xl leading-snug px-4'>
              Selamat, kamu telah menyelesaikan kursus ini!
            </h1>
          </div>
        )}

        {phase === 2 && (
          <div
            className='flex flex-col items-center gap-4 w-full max-w-5xl'
            style={{ animation: 'certSlideUp 0.5s ease both' }}
          >
            {/* Certificate card — containerType enables cqw font units */}
            <div
              ref={cardRef}
              className='relative w-full overflow-hidden rounded-sm shadow-2xl'
              style={
                {
                  aspectRatio: '3508 / 2480',
                  containerType: 'inline-size',
                } as React.CSSProperties
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src='/assets/certificate-template.jpg'
                alt='Template sertifikat'
                className='w-full h-full object-cover'
                crossOrigin='anonymous'
              />

              {/* ── Dynamic text overlays ── */}
              {/* All positioned in the blank area on the right: centered around x=67.5% */}

              {/* Serial number */}
              <div
                className='absolute text-center w-full'
                style={{
                  top: '30%',
                  left: '67.5%',
                  transform: 'translateX(-50%)',
                  maxWidth: '50%',
                  fontSize: '1.1cqw',
                  color: '#6b7280',
                }}
              >
                ID: {certificate.serialNumber}
              </div>

              {/* Recipient label */}
              <div
                className='absolute text-center w-full'
                style={{
                  top: '42%',
                  left: '67.5%',
                  transform: 'translateX(-50%)',
                  maxWidth: '50%',
                  fontSize: '1.4cqw',
                  color: '#6b7280',
                }}
              >
                Diberikan kepada:
              </div>

              {/* Recipient name */}
              <div
                className='absolute font-bold text-center w-full'
                style={{
                  top: '46%',
                  left: '67.5%',
                  transform: 'translateX(-50%)',
                  maxWidth: '55%',
                  fontSize: '3.5cqw',
                  color: '#111827',
                }}
              >
                {certificate.userName}
              </div>

              {/* Course label */}
              <div
                className='absolute text-center w-full'
                style={{
                  top: '60%',
                  left: '67.5%',
                  transform: 'translateX(-50%)',
                  maxWidth: '50%',
                  fontSize: '1.2cqw',
                  color: '#6b7280',
                }}
              >
                Telah berhasil menyelesaikan kursus:
              </div>

              {/* Course name */}
              <div
                className='absolute font-bold text-center w-full'
                style={{
                  top: '65%',
                  left: '67.5%',
                  transform: 'translateX(-50%)',
                  maxWidth: '55%',
                  fontSize: '2.2cqw',
                  lineHeight: '1.2',
                  color: '#047857',
                }}
              >
                {certificate.courseName}
              </div>

              {/* Brand */}
              <div
                className='absolute font-semibold tracking-widest uppercase text-center w-full'
                style={{
                  top: '87%',
                  left: '45%',
                  transform: 'translateX(-50%)',
                  maxWidth: '50%',
                  fontSize: '1.1cqw',
                  color: '#166534',
                }}
              >
                Eduloca
              </div>

              {/* Completion date (right-aligned relative to the right edge) */}
              <div
                className='absolute text-right'
                style={{
                  top: '87%',
                  right: '6%',
                  fontSize: '1cqw',
                  color: '#4b5563',
                }}
              >
                Diterbitkan:{' '}
                {new Intl.DateTimeFormat('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                }).format(new Date(certificate.completionDate))}
              </div>
            </div>

            {downloadError && (
              <p className='text-red-400 text-sm'>
                Gagal mengunduh sertifikat, coba lagi.
              </p>
            )}

            <div className='flex gap-3'>
              <button
                onClick={handleDownload}
                className='px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors'
              >
                Unduh PDF
              </button>
              <button
                onClick={onClose}
                className='px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors'
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
