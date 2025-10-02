import { useHospice } from '@/components/context/hospice-context';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

import { SmallLoader } from '@/features/shared/components/small-loader';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { View } from '../../shared/components/view';
import { useSelectAssignment } from '../hooks/use-select-assignment';
import { ShiftCard } from './shift-card';

type Props = {
  onCancelSchedule: () => void;
  onEditSchedule: () => void;
  onRateNurse: () => void;
  onViewRouteSheet: () => void;
};

export const AssignmentSchedule = ({
  onCancelSchedule,
  onEditSchedule,
  onRateNurse,
  onViewRouteSheet,
}: Props) => {
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
    <View pt="xl" gap="md" mt="lg">
      <BottomSheetFlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={({ item }) => (
          <ShiftCard
            shift={item}
            onCancelSchedule={onCancelSchedule}
            onEditSchedule={onEditSchedule}
            onRateNurse={onRateNurse}
            onViewRouteSheet={onViewRouteSheet}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ gap: 20, paddingBottom: 100, flexGrow: 1 }}
      />
    </View>
  );
};
