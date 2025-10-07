import { Badge } from '@/components/badge/Badge';
import { BadgeVariant } from '@/components/badge/types';
import { Card, CardHeader } from '@/components/card';
import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { api } from '@/convex/_generated/api';
import { Text } from '@/features/shared/components/text';
import { Stack } from '@/features/shared/components/v-stack';
import {
  convertTimeStringToDate,
  getScheduleStatusAndColor,
  getScheduleStatusText,
} from '@/features/shared/utils';

import { useMutation } from 'convex/react';
import { FunctionReturnType } from 'convex/server';
import { format, parse } from 'date-fns';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useGetScheduleId } from '../hooks/use-get-schedule-id';

type Props = {
  shift: FunctionReturnType<typeof api.shifts.getShifts>[number];
  onCancelSchedule: () => void;
  onEditSchedule: () => void;
  onRateNurse: () => void;
  onViewRouteSheet: () => void;
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
  const statusText = getScheduleStatusText(shift.status);
  const statusInfo = getScheduleStatusAndColor(shift.status);
  const getScheduleId = useGetScheduleId((state) => state.setId);
  const startDate = parse(shift.startDate, 'dd-MM-yyyy', new Date());
  const endDate = parse(shift.endDate, 'dd-MM-yyyy', new Date());
  const openingShift = convertTimeStringToDate(shift.startTime);
  const updateStatus = useMutation(api.schedules.updateScheduleStatus);
  useEffect(() => {
    const onUpdate = async () => {
      await updateStatus({
        scheduleId: shift._id,
        status: 'not_covered',
      });
    };

    // Combine date and time
    const shiftStartDateTime = new Date(startDate);
    shiftStartDateTime.setHours(
      openingShift.getHours(),
      openingShift.getMinutes(),
      0,
      0
    );

    const now = new Date();

    // Check if shift start time has passed and it's not covered
    if (
      !shift.nurseId &&
      shift.status !== 'not_covered' &&
      shiftStartDateTime < now
    ) {
      onUpdate();
    }
  }, [
    shift.nurseId,
    shift.status,
    shift.startDate,
    shift.startTime,
    updateStatus,
    shift._id,
    openingShift,
    startDate,
  ]);
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

  return (
    <Card style={styles.card}>
      <CardHeader style={{ gap: 10 }}>
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <View style={styles.imageContainer(size)}>
              <Image style={styles.image} source={shift.nurse?.image} />
            </View>
            <View>
              <Text size="normal" isBold>
                {shift.nurse?.firstName || 'No nurse assigned'}
              </Text>
              <Text size="normal" isBold>
                {format(startDate, 'PP')} - {format(endDate, 'PP')}
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
                <SymbolView
                  name="circle.fill"
                  size={12}
                  tintColor={statusInfo.color}
                />
              }
            />
            <Text size="large" isBold style={{ alignSelf: 'flex-end' }}>
              ${shift.rate}/hr
            </Text>
          </View>
        </View>
        <Stack mode="flex" gap="lg">
          {shift.status === 'completed' && (
            <PrivacyNoticeLink onPress={onViewRouteSheet}>
              View Route Sheet
            </PrivacyNoticeLink>
          )}
          {shift.status !== 'completed' && shift.nurseId && (
            <PrivacyNoticeLink onPress={handleCancelSchedule}>
              Cancel Schedule
            </PrivacyNoticeLink>
          )}
          {shift.status !== 'booked' && (
            <PrivacyNoticeLink onPress={handleEditSchedule}>
              Edit Schedule
            </PrivacyNoticeLink>
          )}
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
