import { registerForPushNotificationsAsync } from '@/lib/register-push-notification';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { PushNotificationPermissionModal } from './push-notification-modal';

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
  /** True when the user has declined push notification permission. */
  permissionDenied: boolean;
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
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const router = useRouter();

  // Track which notification responses we've already handled so cold-start
  // responses aren't processed twice (once by getLastNotificationResponseAsync
  // and once by the listener).
  const handledResponses = useRef<Set<string>>(new Set());

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const responseId = response.notification.request.identifier;
      if (handledResponses.current.has(responseId)) return;
      handledResponses.current.add(responseId);

      const data = response.notification.request.content.data;

      if (data?.type === 'normal') {
        router.push('/');
      }
      if (data?.type === 'nurse_notification') {
        router.push('/nurse-notification');
      }
      if (data?.type === 'hospice_notification') {
        router.push('/hospice-notification');
      }
      if (data?.type === 'hospice_route_sheet_notification') {
        router.push(
          `/view-route-sheet?id=${data?.routeSheetId}&notificationId=${data?.notificationId}&isRead=${data?.isRead}`,
        );
      }
    },
    [router],
  );

  useEffect(() => {
    // Register for push notifications and react to the result.
    registerForPushNotificationsAsync().then((result) => {
      if (result.status === 'granted') {
        setExpoPushToken(result.token);
        setPermissionDenied(false);
      } else if (result.status === 'denied') {
        // User declined — show the soft-prompt modal immediately.
        setPermissionDenied(true);
        setShowPermissionModal(true);
      } else {
        // Device/config error — surface it for debugging.
        setError(new Error(result.message));
      }
    });

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notif) => {
        setNotification(notif);
      },
    );

    // Handle the cold-start case: when the app was completely dead and was
    // launched by tapping a notification, the response listener may fire
    // before the provider tree (ChatWrapper / Stream Chat) is fully mounted.
    // We use getLastNotificationResponseAsync + a delay to give the Chat
    // client time to initialise before we navigate.
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        // Defer navigation so the full component tree (including ChatWrapper
        // and Stream Chat's <Chat> provider) has time to mount and the
        // client can connect.
        setTimeout(() => handleNotificationResponse(response), 1500);
      }
    });

    // For notifications tapped while the app is alive (background / foreground),
    // the providers are already mounted so we can navigate immediately.
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        handleNotificationResponse(response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [router, handleNotificationResponse]);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error, permissionDenied }}
    >
      {children}

      {/* Shown immediately when the user declines push notification permission */}
      <PushNotificationPermissionModal
        visible={showPermissionModal}
        onDismiss={() => setShowPermissionModal(false)}
        onGranted={(token) => {
          setExpoPushToken(token);
          setPermissionDenied(false);
          setShowPermissionModal(false);
        }}
      />
    </NotificationContext.Provider>
  );
};
