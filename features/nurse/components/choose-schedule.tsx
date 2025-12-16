import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Schedule } from '@/features/hospice/components/select-schedule';
import { useSelectAssignment } from '@/features/hospice/hooks/use-select-assignment';
import { Button } from '@/features/shared/components/button';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { View } from '@/features/shared/components/view';
import {
  convertTimeStringToDate2,
  generateErrorMessage,
} from '@/features/shared/utils';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useMutation, useQuery } from 'convex/react';
import { isPast, parse, set } from 'date-fns';
import React, { useState } from 'react';
import { Platform } from 'react-native';

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
  const availableSchedules = schedules.filter(
    (schedule) =>
      schedule.nurseId === nurseId &&
      (schedule.status === 'booked' || schedule.status === 'on_going')
  );
  const onSelect = (id: Id<'schedules'>) => {
    setSelectedIds((prev) => {
      const isInArray = prev.find((item) => item === id);
      if (isInArray) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };
  const selectedSchedules = selectedIds
    .map((selectedId) => {
      return availableSchedules.find(
        (schedule) => schedule._id === selectedId
      )!;
    })
    .filter((schedule) => schedule !== undefined);
  const onSend = async () => {
    for (const selectedSchedule of selectedSchedules) {
      const endDate = selectedSchedule.endDate;

      const { hours, minutes } = convertTimeStringToDate2(
        selectedSchedule.endTime
      );

      const date = parse(endDate, 'dd-MM-yyyy', new Date());
      const fullDateTime = set(date, {
        hours: hours,
        minutes: minutes,
        seconds: 0,
        milliseconds: 0,
      });

      if (isPast(fullDateTime)) {
        showToast({
          title: 'Error',
          subtitle: 'Shift has already passed',
          autodismiss: true,
        });
        return;
      }
    }

    if (!nurseId) return;
    setLoading(true);
    try {
      await sendCaseRequest({
        nurseId,
        scheduleIds: selectedIds,
        isHospice: false,
      });
      showToast({
        title: 'Success',
        subtitle: 'You have sent a case request successfully',
        autodismiss: true,
      });
      onClose();
      setSelectedIds([]);
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to send case request, please try again'
      );
      console.log(error);

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
        contentContainerStyle={{
          gap: 15,
          flexGrow: 1,
          paddingBottom: Platform.OS === 'ios' ? 100 : 50,
        }}
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
