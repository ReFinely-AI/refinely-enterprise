import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines Tailwind classes intelligently.
 * Usage: cn('bg-blue-500', isActive && 'ring-2', 'p-4')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
