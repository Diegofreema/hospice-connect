import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  convertTimeStringToDate2,
  generateErrorMessage,
} from '@/features/shared/utils';
import { useMutation, useQuery } from 'convex/react';
import { isPast, parse, set } from 'date-fns';
import { useState } from 'react';

type Props = {
  businessName: string;
  nurseId?: Id<'nurses'>;
  notificationId: Id<'hospiceNotifications'>;
  hospiceId: Id<'hospices'>;
  scheduleId?: Id<'schedules'>;
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
  const schedule = useQuery(
    api.posts.getShift,
    scheduleId ? { scheduleId } : 'skip'
  );
  const acceptCaseRequest = useMutation(api.schedules.acceptCaseRequest);
  const onDecline = async () => {
    if (!nurseId || !scheduleId || !schedule) return;

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
        title: 'Success',
        subtitle: 'Case request declined successfully',
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to decline case request'
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
  const onAcceptCaseRequest = async () => {
    if (!nurseId || !scheduleId || !schedule) return;
    const endDate = schedule.endDate;
    const { hours, minutes } = convertTimeStringToDate2(schedule.endTime);
    const date = parse(endDate, 'dd-MM-yyyy', new Date());
    const fullDateTime = set(date, {
      hours: hours,
      minutes: minutes,
      seconds: 0,
      milliseconds: 0,
    });
    if (isPast(fullDateTime)) {
      showToast({
        title: 'Error',
        subtitle: 'Shift has already passed',
        autodismiss: true,
      });
      return;
    }
    setProcessing(true);
    try {
      await acceptCaseRequest({
        notificationId,
        nurseId,
        scheduleId,
        hospiceId,
        hospiceName: businessName,
        reassignedAt: Date.now(),
      });
      showToast({
        title: 'Success',
        subtitle: 'Case request accepted successfully',
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to accept case request'
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

  return {
    processing,
    onDecline,
    onAcceptCaseRequest,
  };
};
