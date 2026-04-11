import notifee, { EventType } from '@notifee/react-native';
import { router } from 'expo-router';

export const setNotifeeListeners = () => {
  // NOTE: notifee.onBackgroundEvent can only be called ONCE.
  notifee.onBackgroundEvent(async ({ detail, type }) => {
    if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
      // user press on notification detected while app was on background on Android
      const channelId = detail.notification?.data?.channel_id;
      if (channelId) {
        router.push(`/channel/${channelId}`);
      }
      await Promise.resolve();
    }
  });
};
