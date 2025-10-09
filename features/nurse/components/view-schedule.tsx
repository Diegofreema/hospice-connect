import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useSelectAssignment } from '@/features/hospice/hooks/use-select-assignment';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useQuery } from 'convex/react';
import React from 'react';
import { ViewShiftCard } from './view-schedule-card';

type Props = {
  onClose: () => void;
  nurseId: Id<'nurses'>;
  onOpenSheetCancelSchedule: () => void;
};

export const ViewSchedule = ({
  nurseId,
  onClose,
  onOpenSheetCancelSchedule,
}: Props) => {
  const assignmentId = useSelectAssignment((state) => state.id);
  const data = useQuery(
    api.shifts.getShiftsByOnlyAssignmentId,
    assignmentId ? { assignmentId } : 'skip'
  );

  if (data === undefined) {
    return <SmallLoader size={30} />;
  }
  if (data === null) return null;

  const onAcceptSchedule = () => {};
  return (
    <BottomSheetFlatList
      showsVerticalScrollIndicator={false}
      data={data}
      renderItem={({ item }) => (
        <ViewShiftCard
          shift={item}
          onAcceptSchedule={onAcceptSchedule}
          nurseId={nurseId}
          onOpenSheetCancelSchedule={onOpenSheetCancelSchedule}
          onClose={onClose}
        />
      )}
      style={{ marginTop: 20 }}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ gap: 20, paddingBottom: 100, flexGrow: 1 }}
    />
  );
};
