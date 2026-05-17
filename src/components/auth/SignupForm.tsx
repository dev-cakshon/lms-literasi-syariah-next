'use client';

import { AlertCircle, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Logo } from '@/components/Logo';

import { useAuth } from '@/contexts/AuthContext';

export const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      await signUp(name || email.split('@')[0], email, password);
      // Redirect is handled at page level once auth profile is loaded.
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Gagal mendaftar. Coba lagi.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex bg-surface-soft'>
      {/* Left: form panel */}
      <div className='flex-1 flex items-center justify-center px-5 py-10 md:px-14'>
        <div className='w-full max-w-md'>
          <Logo logotype='text' theme='light' size='md' />

          <h1 className='font-display text-4xl md:text-5xl font-bold tracking-tight text-emerald-deep mt-10 leading-tight'>
            Mulai
            <br />
            Perjalananmu!
          </h1>
          <p className='text-on-surface-soft mt-3 text-base'>
            Buat akun gratis dan mulai belajar ekonomi syariah.
          </p>

          {error && (
            <div className='mt-6 flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm'>
              <AlertCircle
                className='h-5 w-5 flex-shrink-0 mt-0.5'
                aria-hidden
              />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className='mt-8 space-y-5'>
            {/* Name */}
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-semibold text-slate-700 mb-2'
              >
                Nama Lengkap
              </label>
              <div className='relative'>
                <User
                  className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none'
                  aria-hidden
                />
                <input
                  id='name'
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Nama Anda'
                  className='w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-surface-variant bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-accent-lime transition-colors'
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-semibold text-slate-700 mb-2'
              >
                Email
              </label>
              <div className='relative'>
                <Mail
                  className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none'
                  aria-hidden
                />
                <input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder='nama@email.com'
                  className='w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-surface-variant bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-accent-lime transition-colors'
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-semibold text-slate-700 mb-2'
              >
                Password
              </label>
              <div className='relative'>
                <Lock
                  className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none'
                  aria-hidden
                />
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder='Minimal 6 karakter'
                  className='w-full h-14 pl-12 pr-12 rounded-2xl border-2 border-surface-variant bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-accent-lime transition-colors'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((v) => !v)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'
                  aria-label={
                    showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-semibold text-slate-700 mb-2'
              >
                Konfirmasi Password
              </label>
              <div className='relative'>
                <Lock
                  className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none'
                  aria-hidden
                />
                <input
                  id='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder='Ketik ulang password'
                  className='w-full h-14 pl-12 pr-12 rounded-2xl border-2 border-surface-variant bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-accent-lime transition-colors'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'
                  aria-label={
                    showConfirmPassword
                      ? 'Sembunyikan password'
                      : 'Tampilkan password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
            </div>

            {/* CTA */}
            <button
              type='submit'
              disabled={loading}
              className='w-full h-14 mt-2 rounded-2xl font-semibold text-base bg-accent-lime text-accent-lime-ink shadow-[0_4px_0_0_var(--color-accent-lime-dim)] hover:translate-y-px hover:shadow-[0_3px_0_0_var(--color-accent-lime-dim)] active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--color-accent-lime-dim)] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none transition-all'
            >
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className='mt-8 text-center text-sm text-slate-600'>
            Sudah punya akun?{' '}
            <Link
              href='/login'
              className='font-semibold text-emerald-deep hover:underline'
            >
              Masuk di sini
            </Link>
          </p>
          <p className='mt-3 text-center text-sm'>
            <Link
              href='/'
              className='text-slate-400 hover:text-slate-600 transition-colors'
            >
              ← Kembali ke Beranda
            </Link>
          </p>
        </div>
      </div>

      {/* Right: emerald panel — hidden on mobile */}
      <div className='hidden md:flex md:flex-1 bg-emerald-deep relative items-center justify-center overflow-hidden px-12'>
        {/* Decorative blobs */}
        <div className='absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent-lime opacity-10 blur-3xl pointer-events-none' />
        <div className='absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary-fixed opacity-10 blur-3xl pointer-events-none' />

        <div className='relative z-10 text-center'>
          {/* Mascot placeholder — swap for <Image> once final asset is ready */}
          <div className='w-72 h-72 mx-auto mb-10 rounded-3xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-white/40'>
            <span className='text-5xl'>🎓</span>
            <span className='text-xs tracking-widest uppercase'>
              Mascot illustration
            </span>
            <span className='text-xs opacity-60'>coming soon</span>
          </div>

          <p className='font-display text-3xl font-semibold text-white leading-snug'>
            Sudah sampai mana
            <br />
            belajarmu?
          </p>
          <p className='mt-4 text-white/60 text-sm leading-relaxed'>
            Mulai dari sini, satu langkah saja.
          </p>
        </div>
      </div>
    </div>
  );
};
