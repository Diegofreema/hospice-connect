import { api } from '@/convex/_generated/api';
import {
  type Doc,
  type Id,
} from '@/convex/_generated/dataModel';
import { Button } from '@/features/shared/components/button';
import { SmallLoader } from '@/features/shared/components/small-loader';

import { useToast } from '@/components/demos/toast';
import { CustomPressable } from '@/features/shared/components/custom-pressable';
import { Text } from '@/features/shared/components/text';
import {
  convertTimeStringToDate2,
  generateErrorMessage,
} from '@/features/shared/utils';
import { useUpdateUpdateStatus } from '@/hooks/use-update-status';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { IconCircle, IconCircleCheckFilled } from '@tabler/icons-react-native';
import { useMutation, useQuery } from 'convex/react';
import { format, isPast, parse, set } from 'date-fns';
import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useGetNurseId } from '../hooks/use-get-nurse-id';

type Props = {
  id: Id<'assignments'>;
  hospiceId: Id<'hospices'>;
  name: string;
  onClose: () => void;
};

export const SelectSchedule = ({ id, hospiceId, name, onClose }: Props) => {
  const [loading, setLoading] = useState(false);
  const nurseId = useGetNurseId((state) => state.id);
  const onSchedule = useMutation(api.schedules.sendScheduleNotification);
  const schedules = useQuery(api.schedules.fetchAvailableSchedules, {
    assignmentId: id,
    hospiceId,
  });
  const { showToast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Id<'schedules'>[]>([]);

  if (schedules === undefined) {
    return <SmallLoader size={30} />;
  }
  const availableSchedules = schedules.filter(
    (schedule) =>
      schedule.nurseId === nurseId &&
      (schedule.status === 'booked' || schedule.status === 'on_going'),
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
        (schedule) => schedule._id === selectedId,
      )!;
    })
    .filter((schedule) => schedule !== undefined);
  const onSend = async () => {
    if (!nurseId) return;
    for (const selectedSchedule of selectedSchedules) {
      const endDate = selectedSchedule.endDate;
      const { hours, minutes } = convertTimeStringToDate2(
        selectedSchedule.endTime,
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
    setLoading(true);
    try {
      await onSchedule({
        nurseId,
        scheduleIds: selectedIds,
        hospiceId,
        hospiceName: name,
        isHospice: true,
      });
      showToast({
        title: 'Success',
        subtitle: 'Schedule sent successfully',
        autodismiss: true,
      });
      onClose();
      setSelectedIds([]);
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to send schedule',
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
    <BottomSheetFlatList
      data={schedules}
      keyExtractor={(item: Doc<'schedules'>) => item._id}
      renderItem={({ item }: { item: Doc<'schedules'> }) => (
        <Schedule onSelect={onSelect} item={item} selectedIds={selectedIds} />
      )}
      contentContainerStyle={{ gap: 15, flexGrow: 1, paddingBottom: 50 }}
      style={{ flex: 1, marginTop: 20 }}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={
        <Button title="Schedule" onPress={onSend} disabled={loading} />
      }
      ListFooterComponentStyle={{ marginTop: 'auto', marginBottom: 15 }}
      ListEmptyComponent={
        <Text size="large" isBold textAlign="center">
          No shifts available
        </Text>
      }
    />
  );
};

export const Schedule = ({
  item,
  selectedIds,
  onSelect,
}: {
  item: Doc<'schedules'>;
  selectedIds: Id<'schedules'>[] | undefined;
  onSelect: (id: Id<'schedules'>) => void;
}) => {
  const today = new Date();
  const startDate = parse(item.startDate, 'dd-MM-yyyy', today);
  const endDate = parse(item.endDate, 'dd-MM-yyyy', today);
  const openingShiftStr = item.startTime.replace(/\s+/, ' ');
  const openingShift = parse(openingShiftStr, 'h:mm a', today);
  const closingTimeStr = item.endTime.replace(/\s+/, ' ');

  const closingShift = parse(closingTimeStr, 'hh:mm a', today);
  useUpdateUpdateStatus({
    startDate,
    endDate,
    nurseId: item.nurseId!,
    openingShift,
    shiftId: item._id,
    closingShift,
    status: item.status,
  });

  const isSelected = selectedIds?.find((id) => id === item._id);
  return (
    <CustomPressable onPress={() => onSelect(item._id)}>
      <View style={styles.card}>
        {isSelected ? (
          <IconCircleCheckFilled size={25} color="blue" />
        ) : (
          <IconCircle size={25} color="grey" />
        )}
        <View>
          <Text size="normal" isBold>
            {format(startDate, 'MM/dd/yy')} - {format(endDate, 'MM/dd/yy')}
          </Text>
          <Text size="small">
            {item.startTime} - {item.endTime}
          </Text>
        </View>
      </View>
    </CustomPressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: theme.colors.cardGrey,
    padding: theme.paddings.xxl,
    borderRadius: 10,
  },
}));
