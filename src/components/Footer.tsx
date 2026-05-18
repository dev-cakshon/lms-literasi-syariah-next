const FOOTER_LINKS = [
  'Tentang Kami',
  'Pusat Bantuan',
  'Privasi',
  'Syarat & Ketentuan',
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className='w-full bg-surface-container'>
      <div className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6'>
        <div className='flex flex-col items-center md:items-start gap-2'>
          <span className='text-2xl font-bold text-emerald-deep font-display'>
            Eduloca
          </span>
          <p className='text-sm text-on-surface-soft text-center md:text-left'>
            © {year} Eduloca. All rights reserved.
          </p>
        </div>

        <nav className='flex flex-wrap justify-center gap-6 md:gap-8'>
          {FOOTER_LINKS.map((label) => (
            <a
              key={label}
              href='#'
              className='text-sm text-on-surface-soft hover:text-emerald-deep hover:underline decoration-accent-lime-ink decoration-2 underline-offset-4 transition-all duration-200'
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
