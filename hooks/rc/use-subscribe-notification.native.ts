import notifee, { EventType } from '@notifee/react-native';
import { onMessage, onNotificationOpenedApp, getInitialNotification, getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { router } from 'expo-router';
import { useEffect } from 'react';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

// Parses a Stream Chat FCM remote message into title/body/data, unwrapping
// the nested `stream` object so that stream-specific fields surface at the top level.
const extractNotificationConfig = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) => {
  const { stream, ...rest } = remoteMessage.data ?? {};
  const data = {
    ...rest,
    ...((stream as unknown as Record<string, string> | undefined) ?? {}),
  };
  const notification = remoteMessage.notification ?? {};
  const body = (notification.body ?? data.message ?? '') as string;
  const title = (notification.title ?? data.title ?? '') as string;
  return { data, body, title };
};

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
    // Dead-state (app completely closed): defer navigation so the root
    // navigator has time to mount before we push a route onto the stack.
    notifee.getInitialNotification().then((initialNotification) => {
      if (initialNotification) {
        // Notification caused app to open from quit state on Android
        const channelId = initialNotification.notification.data?.channel_id;
        if (channelId) {
          setTimeout(() => router.push(`/channel/${channelId}`), 1500);
        }
      }
    });
    getInitialNotification(firebaseMessaging).then((remoteMessage) => {
      if (remoteMessage) {
        // Notification caused app to open from quit state on iOS
        const channelId = remoteMessage.data?.channel_id;
        if (channelId) {
          setTimeout(() => router.push(`/channel/${channelId}`), 1500);
        }
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
        const { data, body, title } = extractNotificationConfig(remoteMessage);

        // Guard: Stream also sends silent data-only dismiss/clear events with no
        // visible content. Showing those produces ghost notifications in the
        // notification shade — skip them exactly as the background handler does.
        if (!title && !body) {
          return;
        }

        // create the android channel to send the notification to
        const notifeeChannelId = await notifee.createChannel({
          id: 'chat-messages',
          name: 'Chat Messages',
        });

        await notifee.displayNotification({
          title,
          body,
          data,
          android: {
            channelId: notifeeChannelId,
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
