'use client';

import * as React from 'react';

import ButtonLink from '../links/ButtonLink';
import UnstyledLink from '../links/UnstyledLink';

import Logo from "~/svg/Logo.svg";

export const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <header className='fixed top-0 z-50 w-full bg-white shadow-sm'>
            <nav className='layout flex items-center justify-between py-4'>
                {/* Logo */}
                <div className='flex items-center'>
                    {/* <Logo className='h-8 w-8' /> */}
                    <h1>TEST LOGO</h1>
                </div>

                {/* Desktop Navigation */}
                <div className='hidden items-center gap-8 md:flex'>
                    <UnstyledLink
                        href='#course'
                        className='text-gray-700 transition-colors hover:text-gray-900'
                    >
                        Kursus
                    </UnstyledLink>
                    <UnstyledLink
                        href='#about'
                        className='text-gray-700 transition-colors hover:text-gray-900'
                    >
                        Tentang Kami
                    </UnstyledLink>
                    <UnstyledLink
                        href='#feature'
                        className='text-gray-700 transition-colors hover:text-gray-900'
                    >
                        Fitur
                    </UnstyledLink>
                    <ButtonLink href='/dashboard'>Dashboard</ButtonLink>
                    <ButtonLink href='/login' variant='light'>
                        Masuk
                    </ButtonLink>
                    <ButtonLink href='/signup' variant='primary'>
                        Daftar
                    </ButtonLink>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className='md:hidden'
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label='Toggle menu'
                >
                    <svg
                        className='h-6 w-6 text-gray-700'
                        fill='none'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                    >
                        {isMobileMenuOpen ? (
                            <path d='M6 18L18 6M6 6l12 12' />
                        ) : (
                            <path d='M4 6h16M4 12h16M4 18h16' />
                        )}
                    </svg>
                </button>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className='border-t border-gray-200 bg-white md:hidden'>
                    <div className='layout flex flex-col gap-4 py-4'>
                        <UnstyledLink
                            href='#course'
                            className='text-gray-700 transition-colors hover:text-gray-900'
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Kursus
                        </UnstyledLink>
                        <UnstyledLink
                            href='#about'
                            className='text-gray-700 transition-colors hover:text-gray-900'
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Tentang Kami
                        </UnstyledLink>
                        <UnstyledLink
                            href='#feature'
                            className='text-gray-700 transition-colors hover:text-gray-900'
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Fitur
                        </UnstyledLink>
                        <ButtonLink href='/login' variant='light' className='w-full'>
                            Masuk
                        </ButtonLink>
                        <ButtonLink href='/signup' variant='primary' className='w-full'>
                            Daftar
                        </ButtonLink>
                    </div>
                </div>
            )}
        </header>
    );
}