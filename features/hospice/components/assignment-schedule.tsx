import { useHospice } from '@/components/context/hospice-context';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

import { SmallLoader } from '@/features/shared/components/small-loader';
import { View } from '../../shared/components/view';
import { useSelectAssignment } from '../hooks/use-select-assignment';
import { ShiftCard } from './shift-card';

export const AssignmentSchedule = () => {
  const assignmentId = useSelectAssignment((state) => state.id);
  const { hospice } = useHospice();
  const data = useQuery(
    api.shifts.getShifts,
    assignmentId && hospice && hospice._id
      ? { assignmentId, hospiceId: hospice._id }
      : 'skip'
  );

  if (data === undefined) {
    return <SmallLoader />;
  }
  if (data === null) return null;

  return (
    <View pt="xl">
      {data.map((shift) => (
        <ShiftCard key={shift._id} />
      ))}
    </View>
  );
};
