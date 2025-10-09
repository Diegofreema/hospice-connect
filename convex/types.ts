import { Doc } from './_generated/dataModel';

type AssignmentType = Doc<'assignments'>;

export type AvailableAssignmentType = AssignmentType & {
  hospice: Doc<'hospices'> | null;
  schedules: Doc<'schedules'>[];
};
