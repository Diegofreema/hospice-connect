import { useAuth } from '@/components/context/auth';
import { useNotification } from '@/components/providers/notification-context';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useEffect } from 'react';

export const useRecordNotification = () => {
  const recordPushNotificationToken = useMutation(
    api.pushNotifications.recordPushNotificationToken,
  );
  const { expoPushToken } = useNotification();
  const { user } = useAuth();

  // Re-run whenever the push token or the logged-in user changes.
  // This ensures that if a second user logs in on the same device,
  // their token is recorded under their own account instead of the
  // previous user's account.
  useEffect(() => {
    if (!expoPushToken || !user?.id) return;

    recordPushNotificationToken({ token: expoPushToken }).catch((err) => {
      console.error('[useRecordNotification] failed to record token:', err);
    });
  }, [expoPushToken, user?.id, recordPushNotificationToken]);
};
