import { Id } from '@/convex/_generated/dataModel';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Icon } from '@tabler/icons-react-native';
import { Href } from 'expo-router';
import { SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';

type IconMapping = Record<
  SymbolViewProps['name'],
  ComponentProps<typeof MaterialIcons>['name']
>;
export type IconSymbolName = keyof typeof MAPPING;
export const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as IconMapping;
export type LinkType = {
  icon: Icon;
  label: string;
  link: Href;
};

export type NurseNotificationType = {
  hospice: {
    _id: Id<'hospices'>;
    image: string | null | undefined;
    _creationTime: number;
    isApproved?: boolean | undefined;
    faxNumber?: string | undefined;
    email: string;
    phoneNumber: string;
    licenseNumber: string;
    userId: Id<'users'>;
    address: string;
    businessName: string;
    state: string;
    approved: boolean;
  } | null;
  _id: Id<'nurseNotifications'>;
  _creationTime: number;
  hospiceId?: Id<'hospices'> | undefined;
  scheduleId?: Id<'schedules'> | undefined;
  description?: string | undefined;
  type: 'assignment' | 'normal' | 'admin';
  nurseId: Id<'nurses'>;
  isRead: boolean;
  title: string;
  status?: 'accepted' | 'declined';
};
