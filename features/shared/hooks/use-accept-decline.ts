import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { generateErrorMessage } from '../utils';

type Props = {
  nurseId: Id<'nurses'>;
  scheduleId?: Id<'schedules'>;
  nurseNotificationId: Id<'nurseNotifications'>;
};
export const useAcceptDecline = ({
  nurseId,
  nurseNotificationId,
  scheduleId,
}: Props) => {
  const acceptAssignment = useMutation(api.posts.acceptAssignment);
  const declineAssignment = useMutation(api.posts.declineAssignment);
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

  const onAccept = async () => {
    if (!scheduleId || !nurseId || !nurseNotificationId) return;
    setProcessing(true);
    try {
      await acceptAssignment({
        nurseId,
        nurseNotificationId,
        scheduleId,
      });
      showToast({
        title: 'Success',
        subtitle: 'Shift accepted successfully',
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to accept shift'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setProcessing(false);
    }
  };

  const onDecline = async () => {
    if (!scheduleId || !nurseNotificationId) return;
    setProcessing(true);
    try {
      await declineAssignment({
        nurseNotificationId,
        scheduleId,
      });
      showToast({
        title: 'Success',
        subtitle: 'Shift declined successfully',
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to decline shift'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setProcessing(false);
    }
  };

  return { processing, onAccept, onDecline };
};
