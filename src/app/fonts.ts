import { Fraunces, Inter } from 'next/font/google';

export const fontDisplay = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '900'],
});

export const fontPrimary = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
