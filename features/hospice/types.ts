import { Doc, Id } from '@/convex/_generated/dataModel';

export type NurseType = 'RN' | 'LVN' | 'HHA';

export type PostType = {
  _id: Id<'assignments'>;
  _creationTime: number;
  zipCode?: string | undefined;
  assignedTo?: Id<'nurses'> | undefined;
  notes?: string | undefined;
  status: 'completed' | 'not_covered' | 'booked' | 'available';
  gender: string;
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
  careLevel:
    | 'Initial Evaluation'
    | 'Follow Up'
    | 'Continuous Care'
    | 'Supervision'
    | 'Recertification'
    | 'Discharge';
};

export type HospiceNotificationType = {
  _id: Id<'hospiceNotifications'>;
  _creationTime: number;
  nurseId?: Id<'nurses'> | undefined;
  scheduleId?: Id<'schedules'> | undefined;
  description?: string | undefined;
  routeSheetId?: Id<'routeSheets'> | undefined;
  type:
    | 'assignment'
    | 'admin'
    | 'case_request'
    | 'route_sheet'
    | 'cancel_request';
  hospiceId: Id<'hospices'>;
  isRead: boolean;
  title: string;
  nurse: {
    _id: Id<'nurses'>;
    _creationTime: number;
    imageId?: Id<'_storage'> | undefined;
    rate?: number | undefined;
    address?: string | undefined;
    zipCode?: string | undefined;
    firstName: string;
    lastName: string;
    gender: string;
    phoneNumber: string;
    licenseNumber: string;
    stateOfRegistration: string;
    dateOfBirth: string;
    discipline: 'RN' | 'LVN' | 'HHA';
    isApproved: boolean;
    userId: Id<'users'>;
    image: string | null;
    nurseUser: Doc<'users'> | null;
  } | null;
  status?: 'accepted' | 'declined';
};
