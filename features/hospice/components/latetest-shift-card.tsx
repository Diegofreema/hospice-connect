import { Badge } from '@/components/badge/Badge';
import { BadgeVariant } from '@/components/badge/types';
import { Card, CardHeader } from '@/components/card';
import { api } from '@/convex/_generated/api';
import { CustomPressable } from '@/features/shared/components/custom-pressable';
import { Text } from '@/features/shared/components/text';
import {
  fullName,
  getScheduleStatusAndColor,
  getScheduleStatusText,
} from '@/features/shared/utils';
import { useUpdateUpdateStatus } from '@/hooks/use-update-status';
import { IconCircle } from '@tabler/icons-react-native';
import { FunctionReturnType } from 'convex/server';
import { format, parse } from 'date-fns';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  shift: FunctionReturnType<typeof api.shifts.getShifts>['shifts'][number];
};

export const LatestShiftCard = ({ shift }: Props) => {
  const { width } = useWindowDimensions();
  const size = width * 0.13;
  const today = new Date();
  const statusText = getScheduleStatusText(shift.status!);
  const statusInfo = getScheduleStatusAndColor(shift.status!);

  const startDate = parse(shift.startDate!, 'dd-MM-yyyy', today);
  const endDate = parse(shift.endDate!, 'dd-MM-yyyy', today);
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
                  {fullName(shift.nurse?.firstName, shift.nurse?.lastName) ||
                    'No nurse assigned'}
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
