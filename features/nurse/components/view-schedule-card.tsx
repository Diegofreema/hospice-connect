import { Badge } from '@/components/badge/Badge';
import { BadgeVariant } from '@/components/badge/types';
import { Card, CardHeader } from '@/components/card';
import { useToast } from '@/components/demos/toast';
import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useGetScheduleId } from '@/features/hospice/hooks/use-get-schedule-id';
import { Text } from '@/features/shared/components/text';
import { Stack } from '@/features/shared/components/v-stack';
import {
  convertTimeStringToDate,
  generateErrorMessage,
  getScheduleStatusAndColor,
  getScheduleStatusText,
} from '@/features/shared/utils';
import { useUpdateUpdateStatus } from '@/hooks/use-update-status';

import { useMutation } from 'convex/react';
import { FunctionReturnType } from 'convex/server';
import { format, parse } from 'date-fns';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  shift: FunctionReturnType<typeof api.shifts.getShifts>[number];

  onAcceptSchedule: () => void;
  nurseId: Id<'nurses'>;
  onOpenSheetCancelSchedule: () => void;
  onClose: () => void;
};

export const ViewShiftCard = ({
  shift,

  onAcceptSchedule,
  nurseId,
  onClose,
  onOpenSheetCancelSchedule,
}: Props) => {
  const { width } = useWindowDimensions();

  const size = width * 0.13;

  const statusText = getScheduleStatusText(shift.status);
  const statusInfo = getScheduleStatusAndColor(shift.status);
  const getScheduleId = useGetScheduleId((state) => state.setId);
  const sendCaseRequest = useMutation(
    api.hospiceNotification.sendCaseRequestNotification
  );
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();
  const startDate = parse(shift.startDate, 'dd-MM-yyyy', new Date());
  const endDate = parse(shift.endDate, 'dd-MM-yyyy', new Date());
  const openingShift = convertTimeStringToDate(shift.startTime);
  useUpdateUpdateStatus({
    nurseId: shift.nurseId!,
    closingShift: convertTimeStringToDate(shift.endTime),
    shiftId: shift._id,
    startDate,
    status: shift.status,
    endDate,
    openingShift,
  });
  const handleCancelSchedule = () => {
    onOpenSheetCancelSchedule();
    getScheduleId(shift._id);
  };

  const handleAcceptSchedule = async () => {
    setSending(true);
    try {
      await sendCaseRequest({
        nurseId,
        scheduleId: shift._id,
      });
      showToast({
        title: 'Success',
        subtitle: 'Case request sent successfully',
        autodismiss: true,
      });
      onClose();
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to send case request'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setSending(false);
    }
  };

  const isMine = shift.nurseId === nurseId;
  const name = isMine
    ? shift.nurse?.firstName
    : !isMine && shift.nurseId
      ? 'Assigned to a nurse'
      : 'No nurse assigned';
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
                {name}
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
          {shift.status === 'available' && (
            <PrivacyNoticeLink
              onPress={handleAcceptSchedule}
              disabled={sending}
            >
              Accept
            </PrivacyNoticeLink>
          )}
          {shift.status !== 'completed' && shift.nurseId && isMine && (
            <PrivacyNoticeLink onPress={handleCancelSchedule}>
              Cancel Schedule
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
