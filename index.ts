import notifee from '@notifee/react-native';
import { getApp } from '@react-native-firebase/app';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

export const extractNotificationConfig = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) => {
  const { stream, ...rest } = remoteMessage.data ?? {};
  const data = {
    ...rest,
    ...((stream as unknown as Record<string, string> | undefined) ?? {}), // extract and merge stream object if present
  };
  const notification = remoteMessage.notification ?? {};
  const body = (notification.body ?? data.message ?? '') as string;
  const title = (notification.title ?? data.title ?? '') as string;
  return { data, body, title };
};
setBackgroundMessageHandler(getMessaging(getApp()), async (remoteMessage) => {
  // If the remoteMessage contains a notification object, the OS handles it automatically.
  // We only manually display for data-only messages (like Stream Chat) to prevent duplicates.
  if (remoteMessage.notification) {
    return;
  }

  const { data, body, title } = extractNotificationConfig(remoteMessage);

  // Prevent painting empty notifications from phantom dismiss intents or silent data payloads
  if (!title && !body) {
    return;
  }

  // create the android channel to send the notification to
  const channelId = await notifee.createChannel({
    id: 'chat-messages',
    name: 'Chat Messages',
  });
  // display the notification
  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId,
      // add a press action to open the app on press
      pressAction: {
        id: 'default',
      },
    },
  });
}); // <-- file that initializes Unistyles

// eslint-disable-next-line import/first
import 'expo-router/entry';

// eslint-disable-next-line import/first
import './unistyles';
