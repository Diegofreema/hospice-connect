import { Badge } from '@/components/badge/Badge';
import { BadgeVariant } from '@/components/badge/types';
import { Card, CardHeader } from '@/components/card';
import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { api } from '@/convex/_generated/api';
import { Text } from '@/features/shared/components/text';
import { Stack } from '@/features/shared/components/v-stack';
import {
  getScheduleStatusAndColor,
  getScheduleStatusText,
} from '@/features/shared/utils';

import { Id } from '@/convex/_generated/dataModel';
import { CustomPressable } from '@/features/shared/components/custom-pressable';
import { useUpdateUpdateStatus } from '@/hooks/use-update-status';
import { IconCircle } from '@tabler/icons-react-native';
import { FunctionReturnType } from 'convex/server';
import { format, parse } from 'date-fns';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useWindowDimensions, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useGetScheduleId } from '../hooks/use-get-schedule-id';

type Props = {
  shift: FunctionReturnType<typeof api.shifts.getShifts>['shifts'][number];
  onCancelSchedule: () => void;
  onEditSchedule: () => void;
  onRateNurse: () => void;
  onViewRouteSheet: (
    assignmentId: Id<'assignments'>,
    nurseId: Id<'nurses'>
  ) => void;
};

export const ShiftCard = ({
  shift,
  onCancelSchedule,
  onEditSchedule,
  onRateNurse,
  onViewRouteSheet,
}: Props) => {
  const { width } = useWindowDimensions();
  const size = width * 0.13;
  const today = new Date();
  const statusText = getScheduleStatusText(shift.status);
  const statusInfo = getScheduleStatusAndColor(shift.status);
  const getScheduleId = useGetScheduleId((state) => state.setId);
  const startDate = parse(shift.startDate, 'dd-MM-yyyy', today);
  const endDate = parse(shift.endDate, 'dd-MM-yyyy', today);
  const openingShiftStr = shift.startTime.replace(/\s+/, ' ');
  const openingShift = parse(openingShiftStr, 'h:mm a', today);
  const closingTimeStr = shift.endTime.replace(/\s+/, ' ');

  const closingShift = parse(closingTimeStr, 'hh:mm a', today);

  useUpdateUpdateStatus({
    nurseId: shift.nurseId!,
    closingShift,
    shiftId: shift._id,
    startDate,
    status: shift.status,
    endDate,
    openingShift,
  });
  const handleCancelSchedule = () => {
    onCancelSchedule();
    getScheduleId(shift._id);
  };

  const handleEditSchedule = () => {
    onEditSchedule();
    getScheduleId(shift._id);
  };

  const handleRateNurse = () => {
    // if (!shift.nurse) return;
    onRateNurse();
    getScheduleId(shift._id);
  };
  const onPressName = () => {
    if (!shift.nurseId) {
      return;
    }
    router.push(`/view-nurse-profile?id=${shift.nurseId}`);
  };
  return (
    <Card style={styles.card}>
      <CardHeader style={{ gap: 10 }}>
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <View style={styles.imageContainer(size)}>
              <Image style={styles.image} source={shift.nurse?.image} />
            </View>
            <View>
              <CustomPressable onPress={onPressName}>
                <Text size="normal" isBold>
                  {shift.nurse?.name || 'No nurse assigned'}
                </Text>
              </CustomPressable>
              <Text size="normal" isBold>
                {format(startDate, 'MM/dd/yy')} - {format(endDate, 'MM/dd/yy')}
              </Text>
              <Text size="small">
                {shift.startTime} - {shift.endTime}
              </Text>
            </View>
          </View>
          <View style={styles.right}>
            <Badge
              label={statusText}
              variant={statusInfo.status as BadgeVariant}
              size="sm"
              icon={
                <IconCircle
                  size={12}
                  fill={statusInfo.color}
                  color={statusInfo.color}
                />
              }
            />
            <Text size="large" isBold style={{ alignSelf: 'flex-end' }}>
              ${shift.rate}/hr
            </Text>
          </View>
        </View>
        <Stack mode="flex" gap="lg">
          {shift.status === 'completed' &&
            shift.isRouteSheetApproved &&
            shift.nurseId && (
              <PrivacyNoticeLink
                onPress={() =>
                  onViewRouteSheet(shift.assignmentId, shift.nurseId!)
                }
              >
                View Route Sheet
              </PrivacyNoticeLink>
            )}
          {shift.status !== 'completed' &&
            shift.nurseId &&
            shift.status !== 'cancelled' && (
              <PrivacyNoticeLink onPress={handleCancelSchedule}>
                Cancel Schedule
              </PrivacyNoticeLink>
            )}

          <PrivacyNoticeLink onPress={handleEditSchedule}>
            Edit Schedule
          </PrivacyNoticeLink>

          {shift.status === 'completed' && (
            <PrivacyNoticeLink onPress={handleRateNurse}>
              Rate nurse
            </PrivacyNoticeLink>
          )}
        </Stack>
      </CardHeader>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  imageContainer: (size: number) => ({
    width: size,
    height: size,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: theme.colors.grey,
  }),
  image: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: theme.colors.cardGrey,
  },
  header: {
    flexDirection: 'row',

    alignItems: 'center',
    gap: 10,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,

    width: '100%',
  },
  right: {
    gap: 5,
  },
}));
