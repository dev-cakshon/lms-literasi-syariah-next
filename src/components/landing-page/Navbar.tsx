'use client';

import { Menu, X } from 'lucide-react';
import * as React from 'react';

import { Logo } from '@/components/Logo';

import UnstyledLink from '../links/UnstyledLink';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className='sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 shadow-sm'>
      <nav className='layout flex items-center justify-between py-4'>
        {/* Brand */}
        <Logo logotype='textless' theme='light' size='sm' />

        {/* Desktop Navigation */}
        <div className='hidden items-center gap-8 md:flex'>
          <UnstyledLink
            href='#course'
            className='text-gray-700 transition-colors hover:text-primary-700'
          >
            Kursus
          </UnstyledLink>
          <UnstyledLink
            href='#about'
            className='text-gray-700 transition-colors hover:text-primary-700'
          >
            Tentang Kami
          </UnstyledLink>
          <UnstyledLink
            href='#feature'
            className='text-gray-700 transition-colors hover:text-primary-700'
          >
            Fitur
          </UnstyledLink>
          <UnstyledLink
            href='/login'
            className='bg-primary-700 text-white px-6 py-2 rounded-full border-b-2 border-primary-500 hover:-translate-y-0.5 active:translate-y-0 active:border-b-0 transition-all duration-150 font-bold'
          >
            Masuk
          </UnstyledLink>
        </div>

        {/* Mobile Menu Button */}
        <button
          className='md:hidden'
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label='Toggle menu'
        >
          {isMobileMenuOpen ? (
            <X className='h-6 w-6 text-gray-700' />
          ) : (
            <Menu className='h-6 w-6 text-gray-700' />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className='border-t border-gray-200 bg-white/95 md:hidden'>
          <div className='layout flex flex-col gap-4 py-4'>
            <UnstyledLink
              href='#course'
              className='text-gray-700 transition-colors hover:text-primary-700'
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Kursus
            </UnstyledLink>
            <UnstyledLink
              href='#about'
              className='text-gray-700 transition-colors hover:text-primary-700'
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tentang Kami
            </UnstyledLink>
            <UnstyledLink
              href='#feature'
              className='text-gray-700 transition-colors hover:text-primary-700'
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Fitur
            </UnstyledLink>
            <UnstyledLink
              href='/login'
              className='bg-primary-700 text-white text-center px-6 py-3 rounded-full font-bold'
            >
              Masuk
            </UnstyledLink>
            <UnstyledLink
              href='/signup'
              className='bg-accent-lime text-accent-lime-ink text-center px-6 py-3 rounded-full font-bold'
            >
              Daftar
            </UnstyledLink>
          </div>
        </div>
      )}
    </header>
  );
};
