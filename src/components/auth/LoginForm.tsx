'use client';

import { FirebaseError } from 'firebase/app';
import Link from 'next/link';
import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';

function mapFirebaseLoginErrorToIndonesian(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
      return 'Akun tidak ditemukan. Periksa kembali email Anda.';
    case 'auth/wrong-password':
      return 'Password salah. Silakan coba lagi.';
    case 'auth/invalid-credential':
      return 'Email atau password tidak valid.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan login. Silakan coba beberapa saat lagi.';
    case 'auth/invalid-email':
      return 'Format email tidak valid.';
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah. Periksa jaringan Anda lalu coba lagi.';
    default:
      return 'Gagal masuk. Periksa email dan password Anda.';
  }
}

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      // Redirect handled at page level using Firebase token claims.
    } catch (err) {
      const errorMessage =
        err instanceof FirebaseError
          ? mapFirebaseLoginErrorToIndonesian(err.code)
          : err instanceof Error
          ? err.message
          : 'Gagal masuk. Periksa email dan password Anda.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 to-teal-50 px-4'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-slate-800'>Masuk</h1>
          <p className='text-slate-600 mt-2'>
            Selamat datang kembali di LMS Literasi Syariah
          </p>
        </div>

        {error && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-slate-700 mb-1'
            >
              Email
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              placeholder='nama@email.com'
            />
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-slate-700 mb-1'
            >
              Password
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              placeholder='••••••••'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium'
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-slate-600'>
          Belum punya akun?{' '}
          <Link
            href='/signup'
            className='text-primary-600 hover:text-primary-700 font-medium'
          >
            Daftar sekarang
          </Link>
        </p>

        <p className='mt-4 text-center text-sm text-slate-600'>
          <Link
            href='/'
            className='text-primary-600 hover:text-primary-700 font-medium'
          >
            ← Kembali ke Beranda
          </Link>
        </p>
      </div>
    </div>
  );
};
