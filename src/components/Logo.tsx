import Image from 'next/image';

export const Logo = () => {
  return (
    <div className='flex items-center gap-2'>
      <Image
        src='/svg/logolighttextless.svg'
        alt='Eduloca logo'
        width={28}
        height={28}
      />
      <span className='font-bold text-green-800'>Eduloca</span>
    </div>
  );
};
