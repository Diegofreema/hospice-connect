import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { Button } from '@/features/shared/components/button';
import { SmallLoader } from '@/features/shared/components/small-loader';

import { useToast } from '@/components/demos/toast';
import { convertTimeStringToDate } from '@/convex/helper';
import { CustomPressable } from '@/features/shared/components/custom-pressable';
import { Text } from '@/features/shared/components/text';
import { generateErrorMessage } from '@/features/shared/utils';
import { useUpdateUpdateStatus } from '@/hooks/use-update-status';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { IconCircle, IconCircleCheckFilled } from '@tabler/icons-react-native';
import { useMutation, useQuery } from 'convex/react';
import { format, parse } from 'date-fns';
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
  const [selectedId, setSelectedId] = useState<Id<'schedules'> | undefined>(
    schedules?.[0]?._id || undefined
  );

  if (schedules === undefined) {
    return <SmallLoader size={30} />;
  }
  const onSelect = (id: Id<'schedules'>) => {
    setSelectedId(id);
  };
  const onSend = async () => {
    if (!selectedId || !nurseId) return;
    setLoading(true);
    try {
      await onSchedule({
        nurseId,
        scheduleId: selectedId,
        hospiceId,
        hospiceName: name,
      });
      showToast({
        title: 'Success',
        subtitle: 'Schedule sent successfully',
        autodismiss: true,
      });
      onClose();
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to send schedule'
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
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <Schedule onSelect={onSelect} item={item} selectedId={selectedId} />
      )}
      contentContainerStyle={{ gap: 15, flexGrow: 1 }}
      style={{ flex: 1, marginTop: 20 }}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={
        <Button title="Schedule" onPress={onSend} disabled={loading} />
      }
      ListFooterComponentStyle={{ marginTop: 'auto', marginBottom: 15 }}
    />
  );
};

export const Schedule = ({
  item,
  selectedId,
  onSelect,
}: {
  item: Doc<'schedules'>;
  selectedId: Id<'schedules'> | undefined;
  onSelect: (id: Id<'schedules'>) => void;
}) => {
  const startDate = parse(item.startDate, 'dd-MM-yyyy', new Date());
  const endDate = parse(item.endDate, 'dd-MM-yyyy', new Date());
  const openingShift = convertTimeStringToDate(item.startTime);
  const closingShift = convertTimeStringToDate(item.endTime);
  useUpdateUpdateStatus({
    startDate,
    endDate,
    nurseId: item.nurseId!,
    openingShift,
    shiftId: item._id,
    closingShift,
    status: item.status,
  });

  const isSelected = selectedId === item._id;
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
            {format(startDate, 'PP')} - {format(endDate, 'PP')}
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
