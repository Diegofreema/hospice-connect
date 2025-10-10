import { Doc, Id } from '@/convex/_generated/dataModel';
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

export type AvailableAssignmentType = Doc<'assignments'> & {
  hospice: Doc<'hospices'> | null;
  schedules: Doc<'schedules'>[];
};

export type AssignmentWithBusiness = {
  businessName: string | undefined;
  hospiceUserId: Id<'users'>;
  _id: Id<'assignments'>;
  _creationTime: number;
  zipCode?: string | undefined;
  assignedTo?: Id<'nurses'> | undefined;
  notes?: string | undefined;
  gender: 'male' | 'female' | 'others';
  phoneNumber: string;
  dateOfBirth: string;
  discipline: 'RN' | 'LVN' | 'HHA';
  rate: number;
  state: string;
  hospiceId: Id<'hospices'>;
  patientFirstName: string;
  patientLastName: string;
  startDate: string;
  endDate: string;
  openShift: string;
  patientAddress: string;
  status: 'completed' | 'not_covered' | 'booked' | 'available' | 'not_booked';
  careLevel:
    | 'Initial Evaluation'
    | 'Follow Up'
    | 'Continuous Care'
    | 'Supervision'
    | 'Recertification'
    | 'Discharge';
};

export type AssignmentsWithHospicesType = Doc<'assignments'> & {
  hospice: Doc<'hospices'> | null;
};
