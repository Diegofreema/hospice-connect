import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { convertTimeStringToDate2 } from '@/features/shared/utils';
import { useMutation, useQuery } from 'convex/react';
import { isPast, parse, set } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';

type Props = {
  assignmentId: Id<'assignments'>;
  status: 'completed' | 'not_covered' | 'booked' | 'available' | 'ended';
};

export const useUpdatePostStatus = ({ assignmentId, status }: Props) => {
  const updateStatus = useMutation(api.assignments.updateAssignmentStatus);
  const updateStatusToCompleted = useMutation(
    api.assignments.updateAssignmentStatusToCompleted
  );
  const schedules = useQuery(api.shifts.getShiftsByOnlyAssignmentId, {
    assignmentId,
  });
  const isCompleted = status === 'completed' || status === 'ended';

  const lastEnd = useMemo(() => {
    if (!schedules || schedules.length === 0) return null;
    let max: Date | null = null;
    for (const s of schedules) {
      if (!s?.endDate || !s?.endTime) continue;
      const { hours, minutes } = convertTimeStringToDate2(s.endTime || '');
      const base = parse(s.endDate, 'dd-MM-yyyy', new Date());
      const dt = set(base, {
        hours: hours,
        minutes: minutes,
        seconds: 0,
        milliseconds: 0,
      });
      if (!Number.isNaN(dt.getTime())) {
        if (max === null || dt > max) max = dt;
      }
    }
    return max;
  }, [schedules]);

  useFocusEffect(
    useCallback(() => {
      if (!assignmentId || isCompleted) return;
      const run = async () => {
        try {
          if (lastEnd && isPast(lastEnd)) {
            await updateStatusToCompleted({
              assignmentId,
              status: 'completed',
            });
          } else {
            await updateStatus({ assignmentId });
          }
        } catch (error) {
          console.log(error);
        }
      };
      void run();
    }, [
      assignmentId,
      isCompleted,
      lastEnd,
      updateStatus,
      updateStatusToCompleted,
    ])
  );
};
