import * as React from 'react';

export const Footer = () => {
  return (
    <footer className='bg-surface-container w-full py-12'>
      <div className='flex flex-col md:flex-row justify-between items-start px-6 md:px-8 max-w-7xl mx-auto gap-8'>
        {/* Brand */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <span className='material-symbols-outlined text-primary-700 text-2xl'>
              mosque
            </span>
            <span className='font-display font-bold text-xl text-primary-700'>
              Eduloca
            </span>
          </div>
          <p className='text-on-surface-soft text-sm max-w-xs'>
            © 2024 Eduloca. Mencerahkan Umat Melalui Edukasi Keuangan Syariah.
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
                <a
                  href='#'
                  className='text-on-surface-soft hover:text-primary-700 text-sm transition-colors'
                >
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-on-surface-soft hover:text-primary-700 text-sm transition-colors'
                >
                  Syarat &amp; Ketentuan
                </a>
              </li>
            </ul>
          </div>
          <div className='space-y-3'>
            <h4 className='font-bold text-primary-700 uppercase tracking-wide text-sm'>
              Dukungan
            </h4>
            <ul className='space-y-2'>
              <li>
                <a
                  href='#'
                  className='text-on-surface-soft hover:text-primary-700 text-sm transition-colors'
                >
                  Bantuan
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-on-surface-soft hover:text-primary-700 text-sm transition-colors'
                >
                  Kontak
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
