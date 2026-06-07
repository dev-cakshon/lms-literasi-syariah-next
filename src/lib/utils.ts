import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge classes with tailwind-merge with clsx full feature */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Derive avatar initials from a display name.
 *
 * - 2+ words  → first letter of first word + first letter of last word ("Farrel Ibrahim" → "FI")
 * - 1 word    → first two characters ("Farrel" → "FA")
 * - empty/nil → "?"
 *
 * Always returns uppercase.
 */
export function getInitials(name?: string | null): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}
