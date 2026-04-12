import notifee, { EventType } from '@notifee/react-native';
import { onMessage, onNotificationOpenedApp, getInitialNotification, getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { router } from 'expo-router';
import { useEffect } from 'react';

export const useSubscribeNotification = () => {
  useEffect(() => {
    const firebaseMessaging = getMessaging(getApp());
    const unsubscribeOnNotificationOpen = onNotificationOpenedApp(
      firebaseMessaging,
      (remoteMessage) => {
        // Notification caused app to open from background state on iOS
        const channelId = remoteMessage.data?.channel_id;
        // The navigation logic, to navigate to relevant channel screen.
        if (channelId) {
          router.push(`/channel/${channelId}`);
        }
      },
    );
    notifee.getInitialNotification().then((initialNotification) => {
      if (initialNotification) {
        // Notification caused app to open from quit state on Android
        const channelId = initialNotification.notification.data?.channel_id;
        // Start the app with the relevant channel screen.
        router.push(`/channel/${channelId}`);
      }
    });
    getInitialNotification(firebaseMessaging).then((remoteMessage) => {
        if (remoteMessage) {
          // Notification caused app to open from quit state on iOS
          const channelId = remoteMessage.data?.channel_id;
          // Start the app with the relevant channel screen.
          router.push(`/channel/${channelId}`);
        }
      });
    // Foreground notification events (app is open)
    const unsubscribeForegroundEvent = notifee.onForegroundEvent(
      ({ detail, type }) => {
        if (
          type === EventType.PRESS ||
          type === EventType.ACTION_PRESS
        ) {
          // user has pressed notification
          const channelId = detail.notification?.data?.channel_id;
          if (channelId) {
            router.push(`/channel/${channelId}`);
          }
        }
      },
    );

    const unsubscribeOnMessage = onMessage(
      firebaseMessaging,
      async (remoteMessage) => {
        // create the android channel to send the notification to
        const channelId = await notifee.createChannel({
          id: 'chat-messages',
          name: 'Chat Messages',
        });

        const { stream, ...rest } = remoteMessage.data ?? {};
        const data = {
          ...rest,
          ...((stream as unknown as Record<string, string> | undefined) ?? {}),
        };
        const notification = remoteMessage.notification ?? {};
        const body = (data.body ?? notification.body ?? '') as string;
        const title = (data.title ?? notification.title) as string;

        await notifee.displayNotification({
          title,
          body,
          data,
          android: {
            channelId,
            pressAction: {
              id: 'default',
            },
          },
        });
      },
    );

    return () => {
      unsubscribeOnNotificationOpen();
      unsubscribeForegroundEvent();
      unsubscribeOnMessage();
    };
  }, []);
};
