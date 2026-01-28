import { type Doc } from './_generated/dataModel';

type AssignmentType = Doc<'assignments'> & {
  isApproved: boolean;
  isSubmitted: boolean;
};

export type AvailableAssignmentType = AssignmentType & {
  hospice: Doc<'hospices'> | null;
  schedules: Doc<'schedules'>[];
};

export type AssignmentsWithHospicesType = AssignmentType & {
  hospice: Doc<'hospices'> | null;
};

export type InProgressShiftsType = Doc<'assignments'> & {
  hospiceUserId: string;
  businessName: string;
};
