import React from 'react';

import { Avatar } from '@/components/avatar/Avatar';
import { Card, CardFooter, CardHeader } from '@/components/card';
import { CustomPressable } from '@/features/shared/components/custom-pressable';
import { FlexButtons } from '@/features/shared/components/flex-buttons';
import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';
import { useAcceptDecline } from '@/features/shared/hooks/use-accept-decline';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native-unistyles';
import { NurseNotificationType } from '../types';

type Props = {
  notification: NurseNotificationType;
};

export const NurseNotification = ({ notification }: Props) => {
  const date = format(notification._creationTime, 'PP; hh:mm a');
  const firstPart = date.split(',')[0];
  const secondPart = date.split(',')[1].split(';')[0];
  const thirdPart = date.split(';')[1];
  console.log(notification.type);
  const { onAccept, onDecline, processing } = useAcceptDecline({
    scheduleId: notification.scheduleId!,
    nurseId: notification.nurseId!,
    nurseNotificationId: notification._id,
  });
  const onPress = () => {
    if (notification.type === 'assignment') {
      router.push(
        `/view-assignment?id=${notification.scheduleId}&nurseId=${notification.nurseId}&nurseNotificationId=${notification._id}`
      );
    }
  };

  const isDeclined = notification?.status === 'declined';
  const isAccepted = notification?.status === 'accepted';
  const showButtons = !isDeclined && !isAccepted;
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
                  uri: notification.hospice?.image || '',
                  name: notification.hospice?.businessName,
                }}
                size={60}
              />
              <View flex={1}>
                <Text size="medium" isBold>
                  {notification.title}
                </Text>
                {notification.description && (
                  <Text size="normal" style={{ flex: 1 }}>
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
        {notification.type === 'assignment' && (
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
