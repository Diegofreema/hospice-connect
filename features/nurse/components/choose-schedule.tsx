import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Schedule } from '@/features/hospice/components/select-schedule';
import { useSelectAssignment } from '@/features/hospice/hooks/use-select-assignment';
import { Button } from '@/features/shared/components/button';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { View } from '@/features/shared/components/view';
import { generateErrorMessage } from '@/features/shared/utils';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useMutation, useQuery } from 'convex/react';
import React, { useState } from 'react';

type Props = {
  onClose: () => void;
  nurseId: Id<'nurses'>;
};
export const ChooseSchedule = ({ onClose, nurseId }: Props) => {
  const assignmentId = useSelectAssignment((state) => state.id);

  const [loading, setLoading] = useState(false);

  const sendCaseRequest = useMutation(
    api.hospiceNotification.sendCaseRequestNotification
  );
  const { showToast } = useToast();

  const schedules = useQuery(
    api.schedules.getSchedulesByAssignmentId,
    assignmentId
      ? {
          assignmentId,
        }
      : 'skip'
  );
  const [selectedIds, setSelectedIds] = useState<Id<'schedules'>[]>([]);

  if (schedules === undefined) {
    return <SmallLoader size={30} />;
  }
  const onSelect = (id: Id<'schedules'>) => {
    setSelectedIds((prev) => {
      const isInArray = prev.find((item) => item === id);
      if (isInArray) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };
  const onSend = async () => {
    if (!nurseId) return;
    setLoading(true);
    try {
      await sendCaseRequest({
        nurseId,
        scheduleIds: selectedIds,
      });
      showToast({
        title: 'Success',
        subtitle: 'You have sent a case request successfully',
        autodismiss: true,
      });
      onClose();
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to send case request, please try again'
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
  return (
    <View>
      <BottomSheetFlatList
        data={schedules}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Schedule onSelect={onSelect} item={item} selectedIds={selectedIds} />
        )}
        contentContainerStyle={{ gap: 15, flexGrow: 1 }}
        style={{ marginTop: 20 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <Button
            title="Schedule"
            onPress={onSend}
            disabled={loading || selectedIds.length === 0}
          />
        }
        ListFooterComponentStyle={{ marginTop: 'auto', marginBottom: 15 }}
      />
    </View>
  );
};
