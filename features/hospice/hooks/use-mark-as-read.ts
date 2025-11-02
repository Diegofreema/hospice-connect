import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";

type Props = {
  notificationId: Id<"hospiceNotifications">;
};

export const useMarkAsRead = ({ notificationId }: Props) => {
  const markAsRead = useMutation(
    api.hospiceNotification.markSingleNotificationAsRead,
  );
  useEffect(() => {
    const onHandleMarkAsRead = async () => {
      try {
        await markAsRead({ notificationId });
      } catch (e) {
        console.log(e);
      }
    };
    void onHandleMarkAsRead();
  }, [markAsRead, notificationId]);
};
