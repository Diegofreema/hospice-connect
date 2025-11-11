import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { generateErrorMessage } from "@/features/shared/utils";
import { useState } from "react";
import { useToast } from "@/components/demos/toast";
import { Id } from "@/convex/_generated/dataModel";

type Props = {
  businessName: string;
  nurseId?: Id<"nurses">;
  notificationId: Id<"hospiceNotifications">;
  hospiceId: Id<"hospices">;
  scheduleId?: Id<"schedules">;
};

export const useHandleCaseRequest = ({
  notificationId,
  hospiceId,
  scheduleId,
  nurseId,
  businessName,
}: Props) => {
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();
  const declineCaseRequest = useMutation(api.schedules.declineCaseRequest);
  const acceptCaseRequest = useMutation(api.schedules.acceptCaseRequest);
  const onDecline = async () => {
      if(!nurseId || !scheduleId) return;
    setProcessing(true);

    try {
      await declineCaseRequest({
        notificationId,
        nurseId,
        scheduleId,
        hospiceId,
        hospiceName: businessName,
      });
      showToast({
        title: "Success",
        subtitle: "Case request declined successfully",
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        "Failed to decline case request",
      );
      showToast({
        title: "Error",
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setProcessing(false);
    }
  };
  const onAcceptCaseRequest = async () => {
      if(!nurseId || !scheduleId) return;
    setProcessing(true);
    try {
      await acceptCaseRequest({
        notificationId,
        nurseId,
        scheduleId,
        hospiceId,
        hospiceName: businessName,
      });
      showToast({
        title: "Success",
        subtitle: "Case request accepted successfully",
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        "Failed to accept case request",
      );
      showToast({
        title: "Error",
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    onDecline,
    onAcceptCaseRequest,
  };
};
