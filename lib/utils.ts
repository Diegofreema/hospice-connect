import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const formatString = (str: string) => {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
