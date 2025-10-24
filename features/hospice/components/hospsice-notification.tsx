import { Avatar } from '@/components/avatar/Avatar';
import { Card, CardFooter, CardHeader } from '@/components/card';
import { useHospice } from '@/components/context/hospice-context';
import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { CustomPressable } from '@/features/shared/components/custom-pressable';
import { FlexButtons } from '@/features/shared/components/flex-buttons';
import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';
import { generateErrorMessage } from '@/features/shared/utils';
import { useMutation } from 'convex/react';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { useState } from 'react';
import {} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { HospiceNotificationType } from '../types';

type Props = {
  notification: HospiceNotificationType;
};

export const HospiceNotification = ({ notification }: Props) => {
  const date = format(notification._creationTime, 'PP; hh:mm a');
  const { hospice } = useHospice();

  const [processing, setProcessing] = useState(false);
  const cancelRequest = useMutation(api.schedules.cancelSchedule);
  const declineRequest = useMutation(api.schedules.declineSchedule);
  const { showToast } = useToast();
  const firstPart = date.split(',')[0];
  const secondPart = date.split(',')[1].split(';')[0];
  const thirdPart = date.split(';')[1];
  const onPress = () => {
    if (notification.type === 'route_sheet') {
      router.push(`/view-route-sheet?id=${notification?.routeSheetId}`);
    }

    if (notification.type === 'case_request') {
      router.push(
        `/case-request?nurseId=${notification?.nurseId}&shiftId=${notification?.scheduleId}&notificationId=${notification._id}`
      );
    }
  };
  const onDecline = async () => {
    if (
      !hospice ||
      !hospice._id ||
      !notification.nurseId ||
      !notification.scheduleId
    )
      return;
    setProcessing(true);
    try {
      await declineRequest({
        nurseId: notification.nurseId,
        scheduleId: notification.scheduleId,
        hospiceId: hospice._id,
        hospiceName: hospice.businessName as string,
        notificationId: notification._id,
      });
      showToast({
        title: 'Success',
        subtitle: 'Case request declined successfully',
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to decline case request'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setProcessing(false);
    }
  };

  const onAccept = async () => {
    if (
      !hospice ||
      !hospice._id ||
      !notification.nurseId ||
      !notification.scheduleId
    )
      return;
    setProcessing(true);
    try {
      await cancelRequest({
        nurseId: notification.nurseId,
        scheduleId: notification.scheduleId,
        hospiceId: hospice._id,
        hospiceName: hospice.businessName as string,
        notificationId: notification._id,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to accept case request'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setProcessing(false);
    }
  };
  const showButtons =
    notification.status !== 'accepted' && notification.status !== 'declined';
  const isDeclined = notification?.status === 'declined';
  const isAccepted = notification?.status === 'accepted';
  return (
    <CustomPressable onPress={onPress}>
      <Card style={styles.card}>
        <CardHeader>
          <View
            flex={1}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <View flexDirection="row" gap="md" alignItems="center" flex={1}>
              <Avatar
                image={{
                  uri: notification.nurse?.image || '',
                  name: notification.nurse?.nurseUser?.name || 'UNKNOWN',
                }}
                size={60}
              />
              <View flex={1}>
                <Text size="normal" isMedium>
                  {notification.title}
                </Text>
                {notification.description && (
                  <Text size="normal" style={{ flex: 1, maxWidth: '70%' }}>
                    {notification.type === 'cancel_request' && 'Reason: '}{' '}
                    {notification.description}
                  </Text>
                )}
              </View>
            </View>
            <View>
              <Text size="normal" color="grey" textAlign="right">
                {firstPart}
              </Text>
              <Text size="normal" color="grey" textAlign="right">
                {secondPart}
              </Text>
              <Text size="small" color="grey" textAlign="right">
                {thirdPart}
              </Text>
            </View>
          </View>
        </CardHeader>
        {notification.type === 'cancel_request' && (
          <CardFooter>
            {showButtons && (
              <FlexButtons
                onCancel={onDecline}
                onPress={onAccept}
                buttonText="Decline"
                buttonText2="Accept"
                disabled2={processing}
                disabled={processing}
              />
            )}
            {isDeclined && (
              <Text size="medium" color="red" isBold textAlign="center">
                Declined
              </Text>
            )}
            {isAccepted && (
              <Text size="medium" color="green" isBold textAlign="center">
                Accepted
              </Text>
            )}
          </CardFooter>
        )}
      </Card>
    </CustomPressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.greyLight,
  },
}));
