import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { useSelectAssignment } from '@/features/hospice/hooks/use-select-assignment';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useQuery } from 'convex/react';
import { type FunctionReturnType } from 'convex/server';
import React from 'react';
import { ViewShiftCard } from './view-schedule-card';

type Props = {
  onClose: () => void;
  nurseId: Id<'nurses'>;
  onOpenSheetCancelSchedule: () => void;
};

type DataType = FunctionReturnType<
  typeof api.shifts.getShiftsByOnlyAssignmentId
>;
export const ViewSchedule = ({
  nurseId,
  onClose,
  onOpenSheetCancelSchedule,
}: Props) => {
  const assignmentId = useSelectAssignment((state) => state.id);
  const data = useQuery(
    api.shifts.getShiftsByOnlyAssignmentId,
    assignmentId ? { assignmentId } : 'skip',
  );

  if (data === undefined) {
    return <SmallLoader size={30} />;
  }
  if (data === null) return null;

  // Sort shifts so canceled ones appear at the bottom
  const sortedData = [...(data as DataType)].sort((a, b) => {
    // If both are canceled or both are not canceled, maintain original order
    if (a.status === 'cancelled' && b.status === 'cancelled') return 0;
    if (a.status !== 'cancelled' && b.status !== 'cancelled') return 0;

    // Move canceled shifts to the bottom
    if (a.status === 'cancelled') return 1;
    if (b.status === 'cancelled') return -1;

    return 0;
  });

  const onAcceptSchedule = () => {};
  return (
    <BottomSheetFlatList
      showsVerticalScrollIndicator={false}
      data={sortedData}
      renderItem={({ item }: { item: DataType[number] }) => (
        <ViewShiftCard
          shift={item}
          onAcceptSchedule={onAcceptSchedule}
          nurseId={nurseId}
          onOpenSheetCancelSchedule={onOpenSheetCancelSchedule}
          onClose={onClose}
        />
      )}
      style={{ marginTop: 20 }}
      keyExtractor={(item: DataType[number]) => item._id}
      contentContainerStyle={{ gap: 20, paddingBottom: 100, flexGrow: 1 }}
    />
  );
};
