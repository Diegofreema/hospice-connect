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

import { useHandleCaseRequest } from '@/features/shared/hooks/use-handle-case-request';
import { type FunctionReturnType } from 'convex/server';
import { StyleSheet } from 'react-native-unistyles';
import { useMarkAsRead } from '../hooks/use-mark-as-read';

type Props = {
  notification: FunctionReturnType<
    typeof api.hospiceNotification.getNotifications
  >['page'][number];
};

export const HospiceNotification = ({ notification }: Props) => {
  const date = format(notification._creationTime, 'MM/dd/yy hh:mm a');
  const { hospice } = useHospice();

  const [processing, setProcessing] = useState(false);
  const cancelRequest = useMutation(api.schedules.cancelSchedule);
  const declineRequest = useMutation(api.schedules.declineSchedule);
  const { showToast } = useToast();
  const firstPart = date.split(' ')[0];

  const secondPart = date.split(' ')[1] + ' ' + date.split(' ')[2];

  useMarkAsRead({
    notificationId: notification._id,
    isRead: notification.isRead,
  });

  const onPressRouteSheet = () => {
    router.push(
      `/view-route-sheet?id=${notification?.routeSheetId}&notificationId=${notification._id}&isRead=${notification.isRead}`,
    );
  };
  const onPress = () => {
    if (notification.type === 'route_sheet') {
      onPressRouteSheet();
    }

    if (notification.type === 'case_request') {
      router.push(
        `/case-request?nurseId=${notification?.nurseId}&shiftId=${notification?.scheduleId}&notificationId=${notification._id}`,
      );
    }
  };
  const {
    onDecline: onDeclineCaseRequest,
    onAcceptCaseRequest,
    processing: processingCaseRequest,
  } = useHandleCaseRequest({
    notificationId: notification._id,
    nurseId: notification.nurseId,
    scheduleId: notification.scheduleId,
    hospiceId: notification.hospiceId,
    businessName: hospice?.businessName!,
  });

  const handleDecline = async () => {
    if (notification.type === 'cancel_request') {
      await onDecline();
    } else {
      await onDeclineCaseRequest();
    }
  };

  const handleAccept = async () => {
    if (notification.type === 'cancel_request') {
      await onAccept();
    } else {
      await onAcceptCaseRequest();
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
        'Failed to decline case request',
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
        scheduleId: notification.scheduleId,
        hospiceId: hospice._id,
        notificationId: notification._id,
        isCancelRequest: true,
      });
      showToast({
        title: 'Success',
        subtitle: 'Case cancel request accepted successfully',
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to accept case cancel request',
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
  const isRouteSheet = notification.type === 'route_sheet';
  const showFooter = [
    'cancel_request',
    'case_request',
    'route_sheet',
    'reassignment',
  ].includes(notification.type);
  const notInteracted = !isDeclined && !isAccepted;
  return (
    <CustomPressable onPress={onPress}>
      <Card style={styles.card(notification.isRead)}>
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
                <Text size="medium" isBold>
                  {notification.title}
                </Text>
                {notification.description && (
                  <Text size="normal" style={{ flex: 1, maxWidth: '80%' }}>
                    {notification.type === 'cancel_request' && 'Reason: '}{' '}
                    {notification.description}
                  </Text>
                )}
              </View>
            </View>
            <View>
              <Text size="small" color="grey" textAlign="right">
                {firstPart}
              </Text>

              <Text size="small" color="grey" textAlign="right">
                {secondPart}
              </Text>
            </View>
          </View>
        </CardHeader>
        {showFooter && (
          <CardFooter>
            {showButtons && !isRouteSheet && (
              <FlexButtons
                onCancel={handleDecline}
                onPress={handleAccept}
                buttonText="Decline"
                buttonText2="Accept"
                disabled2={processing || processingCaseRequest}
                disabled={processing || processingCaseRequest}
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
            {isRouteSheet && notInteracted && (
              <CustomPressable
                onPress={onPressRouteSheet}
                style={styles.button}
              >
                <Text size="medium" color="white" isBold textAlign="center">
                  View Route Sheet
                </Text>
              </CustomPressable>
            )}
          </CardFooter>
        )}
      </Card>
    </CustomPressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: (isRead: boolean) => ({
    backgroundColor: theme.colors.greyLight,
    borderWidth: 1,
    borderColor: isRead ? 'transparent' : theme.colors.grey,
  }),
  button: {
    padding: 5,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    backgroundColor: theme.colors.blue,
  },
}));
