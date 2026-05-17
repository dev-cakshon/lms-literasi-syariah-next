import { Epilogue, Plus_Jakarta_Sans } from 'next/font/google';

export const fontDisplay = Epilogue({
  subsets: ['latin'],
  variable: '--font-epilogue',
  display: 'swap',
  weight: ['600', '700'],
});

export const fontPrimary = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '600', '700'],
});
