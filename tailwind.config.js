// Tailwind CSS v4 uses CSS-based configuration in globals.css
// This config file is kept for compatibility with tools like uploadthing
const { withUt } = require('uploadthing/tw');

/** @type {import('tailwindcss').Config} */
module.exports = withUt({
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  plugins: [require('@tailwindcss/typography')],
});
