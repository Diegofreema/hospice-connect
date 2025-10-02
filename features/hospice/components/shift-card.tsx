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

import { FunctionReturnType } from 'convex/server';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useWindowDimensions, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

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
                {format(shift.startDate, 'PPP')} -{' '}
                {format(shift.endDate, 'PPP')}
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
          {shift.status !== 'completed' && (
            <PrivacyNoticeLink onPress={onCancelSchedule}>
              Cancel Schedule
            </PrivacyNoticeLink>
          )}
          {shift.status !== 'booked' && (
            <PrivacyNoticeLink onPress={onEditSchedule}>
              Edit Schedule
            </PrivacyNoticeLink>
          )}
          {/* {shift.status === 'completed' && ( */}
          <PrivacyNoticeLink onPress={onRateNurse}>
            Rate nurse
          </PrivacyNoticeLink>
          {/* )} */}
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
