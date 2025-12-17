import { useHospice } from '@/components/context/hospice-context';
import { api } from '@/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';

import { useToast } from '@/components/demos/toast';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/features/shared/components/button';
import CancelAssignmentModal from '@/features/shared/components/cancel-modal';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { generateErrorMessage } from '@/features/shared/utils';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useState } from 'react';
import { View } from '../../shared/components/view';
import { useSelectAssignment } from '../hooks/use-select-assignment';
import { ShiftCard } from './shift-card';

type Props = {
  onCancelSchedule: () => void;
  onEditSchedule: () => void;
  onRateNurse: () => void;
  onViewRouteSheet: (
    assignmentId: Id<'assignments'>,
    nurseId: Id<'nurses'>
  ) => void;
};

export const AssignmentSchedule = ({
  onCancelSchedule,
  onEditSchedule,
  onRateNurse,
  onViewRouteSheet,
}: Props) => {
  const assignmentId = useSelectAssignment((state) => state.id);
  const cancelAssignment = useMutation(api.assignments.cancelAssignment);
  const { hospice } = useHospice();
  const { showToast } = useToast();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const data = useQuery(
    api.shifts.getShifts,
    assignmentId && hospice && hospice._id
      ? { assignmentId, hospiceId: hospice._id }
      : 'skip'
  );
  const onCancel = async (reason: string) => {
    if (!assignmentId || !hospice?._id) return;
    setLoading(true);

    const cancelledAt = Date.now();
    try {
      await cancelAssignment({
        assignmentId,
        hospiceId: hospice._id,
        reason,
        cancelledAt,
      });
      showToast({
        title: 'Success',
        subtitle: 'Assignment cancelled successfully',
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to cancel assignment'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (data === undefined) {
    return <SmallLoader size={50} />;
  }
  if (data === null) return null;

  const shiftsHasNurse = data.shifts.some((shift) => shift.nurseId);
  const showCancelButton =
    data.assignment?.status !== 'completed' && !data.assignment?.isCanceled;

  const sortedShift = [...data.shifts].sort((a, b) => {
    if (a.status === 'cancelled' && b.status !== 'cancelled') return 1;
    if (a.status !== 'cancelled' && b.status === 'cancelled') return -1;
    return 0;
  });
  return (
    <View pt="xl" gap="md" mt="lg">
      <BottomSheetFlatList
        showsVerticalScrollIndicator={false}
        data={sortedShift}
        renderItem={({ item }) => (
          <ShiftCard
            shift={item}
            discipline={data.assignment?.discipline || ''}
            onCancelSchedule={onCancelSchedule}
            onEditSchedule={onEditSchedule}
            onRateNurse={onRateNurse}
            onViewRouteSheet={onViewRouteSheet}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ gap: 20, paddingBottom: 100, flexGrow: 1 }}
        ListFooterComponent={
          showCancelButton && shiftsHasNurse ? (
            <Button
              title="End assignment"
              onPress={() => setVisible(true)}
              disabled={loading}
            />
          ) : null
        }
      />
      <CancelAssignmentModal
        visible={visible}
        onClose={() => setVisible(false)}
        onConfirm={onCancel}
      />
    </View>
  );
};
