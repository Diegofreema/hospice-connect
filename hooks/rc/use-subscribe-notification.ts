import notifee from '@notifee/react-native';
import { getApp } from '@react-native-firebase/app';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import {
  getInitialNotification,
  getMessaging,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';
import { router } from 'expo-router';
import { useEffect } from 'react';

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
type Props = {
  setInitialChannelId: (channelId: string) => void;
};
export const useSubscribeNotification = ({ setInitialChannelId }: Props) => {
  useEffect(() => {
    const firebaseMessaging = getMessaging(getApp());

    // ─── Background state (app was alive but backgrounded) ───────────────────
    // The navigator is already mounted here, so we navigate immediately.
    const unsubscribeOnNotificationOpen = onNotificationOpenedApp(
      firebaseMessaging,
      (remoteMessage) => {
        const { data } = extractNotificationConfig(remoteMessage);
        const channelId = data?.channel_id;
        console.log('Background', { data });

        if (channelId) {
          router.push(`/channel/${channelId}`);
        }
      },
    );

    // ─── Dead state / Cold start ──────────────────────────────────────────────
    // Don't navigate here — the ChatWrapper's conditional <Chat> rendering
    // causes a full tree remount when the client initialises, which wipes any
    // navigation performed before the client is ready. Instead, store the
    // channel ID; ChatWrapper will navigate once the client is available.

    // Android (notifee)
    notifee.getInitialNotification().then((initialNotification) => {
      if (initialNotification) {
        const data = initialNotification.notification.data as Record<
          string,
          string | undefined
        >;
        const channelId = data?.channel_id;

        if (channelId) {
          setInitialChannelId(channelId);
        }
      }
    });

    // iOS (Firebase getInitialNotification)
    getInitialNotification(firebaseMessaging).then((remoteMessage) => {
      if (remoteMessage) {
        const { data } = extractNotificationConfig(remoteMessage);
        const channelId = data?.channel_id as string | undefined;
        if (channelId) {
          setInitialChannelId(channelId);
        }
      }
    });

    // // ─── Foreground FCM message received ─────────────────────────────────────
    // const unsubscribeOnMessage = onMessage(
    //   firebaseMessaging,
    //   async (remoteMessage) => {
    //     const { data, body, title } = extractNotificationConfig(remoteMessage);

    //     // Guard: Stream also sends silent data-only dismiss/clear events with no
    //     // visible content. Showing those produces ghost notifications in the
    //     // notification shade — skip them exactly as the background handler does.
    //     if (!title && !body) {
    //       return;
    //     }

    //     const notifeeChannelId = await notifee.createChannel({
    //       id: 'chat-messages',
    //       name: 'Chat Messages',
    //     });

    //     await notifee.displayNotification({
    //       title,
    //       body,
    //       data,
    //       android: {
    //         channelId: notifeeChannelId,
    //         pressAction: { id: 'default' },
    //       },
    //     });
    //   },
    // );

    return () => {
      unsubscribeOnNotificationOpen();
    };
  }, [setInitialChannelId]);
};
