import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { useEffect } from 'react';

type Props = {
  notificationId: Id<'hospiceNotifications'>;
  isRead?: boolean;
};

export const useMarkAsRead = ({ notificationId, isRead }: Props) => {
  const updateViewCount = useMutation(api.hospiceNotification.updateViewCount);
  useEffect(() => {
    const onUpdateViewCount = async () => {
      if (isRead) return;
      try {
        await updateViewCount({
          notificationId,
        });
      } catch (error) {
        console.log(error);
      }
    };
    void onUpdateViewCount();
  }, [updateViewCount, notificationId, isRead]);
};
