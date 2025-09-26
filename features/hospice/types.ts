import { Id } from '@/convex/_generated/dataModel';

export type NurseType = 'RN' | 'LVN' | 'HHA';

export type PostType = {
  _id: Id<'assignments'>;
  _creationTime: number;
  zipCode?: string | undefined;
  assignedTo?: Id<'nurses'> | undefined;
  notes?: string | undefined;
  status: 'completed' | 'not_covered' | 'booked' | 'available' | 'not_booked';
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
