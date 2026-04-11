import { requestPermission } from '@/lib/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { useEffect, useRef } from 'react';
import { StreamChat } from 'stream-chat';

export const useRegisterDevice = (
  client: StreamChat | null,
  userId: string,
) => {
  const unsubscribeTokenRefreshListenerRef = useRef<() => void>(() => {});
  useEffect(() => {
    // Register FCM token with stream chat server.
    const registerPushToken = async () => {
      if (!client) {
        return;
      }
      // unsubscribe any previous listener
      unsubscribeTokenRefreshListenerRef.current?.();
      
      let token;
      try {
        if (!messaging().isDeviceRegisteredForRemoteMessages) {
          await messaging().registerDeviceForRemoteMessages();
        }
        token = await messaging().getToken();
      } catch (error) {
        console.warn('Push Notifications are not fully supported on this device/simulator:', error);
        return;
      }
      const push_provider = 'firebase';
      const push_provider_name = 'firebase'; // name an alias for your push provider (optional)
      client.addDevice(token, push_provider, userId, push_provider_name);
      await AsyncStorage.setItem('@current_push_token', token);
      const removeOldToken = async () => {
        const oldToken = await AsyncStorage.getItem('@current_push_token');
        if (oldToken !== null) {
          await client.removeDevice(oldToken);
          await AsyncStorage.removeItem('@current_push_token');
        }
      };
      unsubscribeTokenRefreshListenerRef.current = messaging().onTokenRefresh(
        async (newToken) => {
          await Promise.all([
            removeOldToken(),
            client.addDevice(
              newToken,
              push_provider,
              userId,
              push_provider_name,
            ),
            AsyncStorage.setItem('@current_push_token', newToken),
          ]);
        },
      );
    };
    const init = async () => {
      await requestPermission();

      await registerPushToken();
    };
    init();
    return () => {
      unsubscribeTokenRefreshListenerRef.current?.();
    };
  }, [client, userId]);
};
