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

        if (data.type === 'normal') {
          router.push('/');
        }
        if (data.type === 'nurse_notification') {
          router.push('/nurse-notification');
        }
        if (data.type === 'hospice_notification') {
          router.push('/hospice-notification');
        }
        if (data.type === 'hospice_route_sheet_notification') {
          router.push(
            `/view-route-sheet?id=${data?.routeSheetId}&notificationId=${data?.notificationId}&isRead=${data?.isRead}`,
          );
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
