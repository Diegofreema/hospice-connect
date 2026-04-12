import notifee from '@notifee/react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

import { setNotifeeListeners } from './lib/utils/setNotifeeListener';

setNotifeeListeners();
export const extractNotificationConfig = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) => {
  const { stream, ...rest } = remoteMessage.data ?? {};
  const data = {
    ...rest,
    ...((stream as unknown as Record<string, string> | undefined) ?? {}), // extract and merge stream object if present
  };
  const notification = remoteMessage.notification ?? {};
  const body = (data.body ?? notification.body ?? '') as string;
  const title = (data.title ?? notification.title) as string;
  return { data, body, title };
};
setBackgroundMessageHandler(getMessaging(getApp()), async (remoteMessage) => {
  // create the android channel to send the notification to
  const channelId = await notifee.createChannel({
    id: 'chat-messages',
    name: 'Chat Messages',
  });
  // display the notification
  const { data, body, title } = extractNotificationConfig(remoteMessage);
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
