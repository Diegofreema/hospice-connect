import { api } from '@/convex/_generated/api';
import { registerForPushNotificationsAsync } from '@/lib/register-push-notification';
import { useMutation } from 'convex/react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationContextType {
  expoPushToken: string | undefined;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
  const recordPushNotificationToken = useMutation(
    api.pushNotifications.recordPushNotificationToken,
  );

  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const router = useRouter();
  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => {
        setExpoPushToken(token);
        const registerPush = async () => {
          await recordPushNotificationToken({
            token: token as string,
          });
        };
        registerPush();
      },
      (error) => setError(error),
    );
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        // if (data.type === 'single') {
        //   onMessage(data.loggedInUserId as string, 'single');
        // }
        // if (data.type === 'group') {
        //   onMessage(data.conversationId as string, 'group');
        // }
        // ! to fix route later
        if (data.type === 'starred') {
        }
        if (data.type === 'notification') {
        }
        if (data.type === 'review') {
        }
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [router, recordPushNotificationToken]);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
