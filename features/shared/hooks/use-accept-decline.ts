import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { isPast, parse, set } from 'date-fns';
import { useState } from 'react';
import { convertTimeStringToDate2, generateErrorMessage } from '../utils';

type Props = {
  nurseId: Id<'nurses'>;
  scheduleId?: Id<'schedules'>;
  nurseNotificationId: Id<'nurseNotifications'>;
  type: 'admin' | 'assignment' | 'normal' | 'reassignment';
};
export const useAcceptDecline = ({
  nurseId,
  nurseNotificationId,
  scheduleId,
  type,
}: Props) => {
  const acceptAssignment = useMutation(api.posts.acceptAssignment);
  const acceptResignAssignment = useMutation(api.assignments.reassignShift);
  const declineAssignment = useMutation(api.posts.declineAssignment);
  const schedule = useQuery(
    api.posts.getShift,
    scheduleId ? { scheduleId } : 'skip'
  );
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

  const onAccept = async () => {
    if (!scheduleId || !nurseId || !nurseNotificationId || !schedule) return;

    const startDate = schedule.startDate;
    const { hours, minutes } = convertTimeStringToDate2(schedule.startTime);
    const date = parse(startDate, 'dd-MM-yyyy', new Date());
    const fullDateTime = set(date, {
      hours: hours,
      minutes: minutes,
      seconds: 0,
      milliseconds: 0,
    });
    if (isPast(fullDateTime) && type !== 'reassignment') {
      showToast({
        title: 'Error',
        subtitle: 'Shift has already passed',
        autodismiss: true,
      });
      return;
    }

    setProcessing(true);
    try {
      if (type === 'reassignment') {
        await acceptResignAssignment({
          newNurseId: nurseId,
          notificationId: nurseNotificationId,
          assignmentId: schedule.assignmentId,
          shift: schedule._id,
          assignedAt: Date.now(),
        });
      } else {
        await acceptAssignment({
          nurseId,
          nurseNotificationId,
          scheduleId,
        });
      }
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
        autodismiss: false,
      });
    } finally {
      setProcessing(false);
    }
  };

  return { processing, onAccept, onDecline };
};
