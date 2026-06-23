import * as React from 'react';

import { Logo } from '@/components/Logo';

export const Footer = () => {
  return (
    <footer className='bg-surface-container w-full py-12'>
      <div className='flex flex-col md:flex-row justify-between items-start px-6 md:px-8 max-w-7xl mx-auto gap-8'>
        {/* Brand */}
        <div className='space-y-3'>
          <Logo logotype='textless' theme='light' size='sm' />
          <p className='text-on-surface-soft text-sm max-w-xs'>
            © 2026 Eduloca. All rights reserved.
          </p>
        </div>

        {/* Link columns */}
        <div className='flex gap-12'>
          <div className='space-y-3'>
            <h4 className='font-bold text-primary-700 uppercase tracking-wide text-sm'>
              Legal
            </h4>
            <ul className='space-y-2'>
              <li>
                <button
                  type='button'
                  className='text-on-surface-soft hover:text-primary-700 text-sm transition-colors'
                >
                  Kebijakan Privasi
                </button>
              </li>
              <li>
                <button
                  type='button'
                  className='text-on-surface-soft hover:text-primary-700 text-sm transition-colors'
                >
                  Syarat &amp; Ketentuan
                </button>
              </li>
            </ul>
          </div>
          <div className='space-y-3'>
            <h4 className='font-bold text-primary-700 uppercase tracking-wide text-sm'>
              Dukungan
            </h4>
            <ul className='space-y-2'>
              <li>
                <button
                  type='button'
                  className='text-on-surface-soft hover:text-primary-700 text-sm transition-colors'
                >
                  Bantuan
                </button>
              </li>
              <li>
                <button
                  type='button'
                  className='text-on-surface-soft hover:text-primary-700 text-sm transition-colors'
                >
                  Kontak
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
