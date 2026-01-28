import { Id } from '@/convex/_generated/dataModel';

export type ApprovalType = {
  id: Id<'nurses'> | Id<'hospices'>;
  name: string;
  email: string;
  discipline?: string;
  state: string;
};
