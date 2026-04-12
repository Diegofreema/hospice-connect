import { Status } from '@/features/authentication/admin/nurses/types';
import { AuthorizationStatus, getMessaging, requestPermission as firebaseRequestPermission } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { clsx, type ClassValue } from 'clsx';
import { PermissionsAndroid, Platform } from 'react-native';
import { twMerge } from 'tailwind-merge';
export const formatString = (str: string) => {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateStatusColorAndBackgroundColor = (status: Status) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-500 bg-yellow-50';
    case 'approved':
      return 'text-green-500 bg-green-50';
    case 'rejected':
      return 'text-red-500 bg-red-50';
    default:
      return 'text-gray-500 bg-gray-50';
  }
};

export const getScheduleStatusAndColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-500 bg-green-50';
    case 'booked':
      return 'text-purple-500 bg-purple-50';
    case 'on_going':
      return 'text-blue-500 bg-blue-50';
    case 'not_covered':
    case 'cancelled':
    case 'ended':
      return 'text-red-500 bg-red-50';
    default:
      return 'text-yellow-500 bg-yellow-50';
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

export const requestPermission = async () => {
  // Request permission for Android 13 and above
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return;
  }
  const fcmMessaging = getMessaging(getApp());
  const authStatus = await firebaseRequestPermission(fcmMessaging);
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;
  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
};
