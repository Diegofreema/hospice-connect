import { Status } from '@/features/authentication/admin/nurses/types';
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

export const generateStatusColor = (status: Status) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-500';
    case 'approved':
      return 'text-green-500';
    case 'rejected':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

export const generateStatusText = (status: Status) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Suspended';
  }
};
