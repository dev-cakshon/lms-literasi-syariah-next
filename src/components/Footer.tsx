const FOOTER_LINKS = [
  'Tentang Kami',
  'Pusat Bantuan',
  'Privasi',
  'Syarat & Ketentuan',
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className='w-full py-10 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-[var(--color-surface-variant)] border-t-2 border-[var(--color-outline-variant)]'>
      <div className='flex flex-col items-center md:items-start gap-1'>
        <span className='text-2xl font-bold text-[var(--color-emerald-deep)] font-display'>
          Eduloca
        </span>
        <p className='text-sm text-[var(--color-on-surface-soft)] text-center md:text-left'>
          © {year} Eduloca. All rights reserved.
        </p>
      </div>

      <nav className='flex flex-wrap justify-center gap-6 md:gap-8'>
        {FOOTER_LINKS.map((label) => (
          <a
            key={label}
            href='#'
            className='text-sm text-[var(--color-on-surface-soft)] hover:text-[var(--color-emerald-deep)] hover:underline decoration-[var(--color-accent-lime-ink)] decoration-2 underline-offset-4 transition-all duration-200'
          >
            {label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
