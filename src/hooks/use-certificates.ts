'use client';

import { useEffect, useState } from 'react';

import { getMyAllCertificates } from '@/lib/api';

import type { Certificate } from '@/types';

interface UseCertificatesResult {
  certificates: Certificate[];
  loading: boolean;
  error: boolean;
}

export function useMyCertificates(): UseCertificatesResult {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getMyAllCertificates()
      .then(setCertificates)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return { certificates, loading, error };
}
