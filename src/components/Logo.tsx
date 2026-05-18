import Image from 'next/image';

type LogoProps = {
  logotype?: 'text' | 'textless';
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
};

const sizes = {
  sm: { px: 40, textClass: 'text-xl' },
  md: { px: 56, textClass: 'text-2xl' },
  lg: { px: 80, textClass: 'text-4xl' },
};

export const Logo = ({
  logotype = 'textless',
  theme = 'light',
  size = 'md',
  showText = true,
}: LogoProps) => {
  const src = `/svg/logo${theme}${logotype}.svg`;
  const { px, textClass } = sizes[size];

  if (logotype === 'text') {
    return <Image src={src} alt='Eduloca' width={px} height={px} />;
  }

  return (
    <div className='flex items-center gap-2'>
      <Image src={src} alt='Eduloca logo' width={px} height={px} />
      {showText && (
        <span
          className={`font-bold ${textClass} ${theme === 'dark' ? 'text-white' : 'text-green-800'}`}
        >
          Eduloca
        </span>
      )}
    </div>
  );
};
