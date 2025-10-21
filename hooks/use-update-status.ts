import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
type Props = {
  startDate: Date;
  openingShift: Date;
  nurseId: Id<'nurses'>;
  shiftId: Id<'schedules'>;
  status: 'not_covered' | 'booked' | 'completed' | 'available' | 'cancelled';
  endDate: Date;
  closingShift: Date;
};
export const useUpdateUpdateStatus = ({
  nurseId,
  openingShift,
  shiftId,
  startDate,
  status,
  closingShift,
  endDate,
}: Props) => {
  const updateStatus = useMutation(api.schedules.updateScheduleStatus);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const validateAndUpdateStatus = async () => {
        // Validate inputs
        const parsedStartDate =
          typeof startDate === 'string' ? new Date(startDate) : startDate;
        const parsedEndDate =
          typeof endDate === 'string' ? new Date(endDate) : endDate;

        if (
          isNaN(parsedStartDate.getTime()) ||
          isNaN(parsedEndDate.getTime())
        ) {
          console.error('Invalid startDate or endDate');
          return;
        }

        // Combine date and time for shift start
        const shiftStartDateTime = new Date(parsedStartDate);
        shiftStartDateTime.setHours(
          openingShift.getHours(),
          openingShift.getMinutes(),
          0,
          0
        );

        const now = new Date();

        // Check if shift has STARTED (current time is past shift start)
        // AND there's no nurse assigned AND status is not already 'not_covered'
        if (!nurseId && status !== 'not_covered' && now >= shiftStartDateTime) {
          try {
            if (isMounted) {
              await updateStatus({
                scheduleId: shiftId,
                status: 'not_covered',
              });
            }
          } catch (err) {
            if (isMounted) {
              console.error('Failed to update shift status:', err);
            }
          }
        }
      };

      validateAndUpdateStatus();

      return () => {
        isMounted = false;
      };
    }, [
      nurseId,
      status,
      startDate,
      endDate,
      shiftId,
      openingShift,
      updateStatus,
    ])
  );

  useFocusEffect(
    useCallback(() => {
      let isMounted = true; // Track component mount status

      const validateAndUpdateStatus = async () => {
        // Validate inputs
        const parsedStartDate =
          typeof startDate === 'string' ? new Date(startDate) : startDate;
        const parsedEndDate =
          typeof endDate === 'string' ? new Date(endDate) : endDate;

        if (
          isNaN(parsedStartDate.getTime()) ||
          isNaN(parsedEndDate.getTime())
        ) {
          console.error('Invalid startDate or endDate');
          return;
        }

        // Combine date and time for shift start
        const shiftStartDateTime = new Date(parsedStartDate);
        shiftStartDateTime.setHours(
          openingShift.getHours(),
          openingShift.getMinutes(),
          0,
          0
        );

        // Combine date and time for shift end
        const shiftEndDateTime = new Date(parsedEndDate);
        shiftEndDateTime.setHours(
          closingShift.getHours(),
          closingShift.getMinutes(),
          0,
          0
        );

        const now = new Date();

        // Check if shift has started, ended, and is assigned to a nurse
        if (
          nurseId &&
          status !== 'completed' &&
          shiftStartDateTime < now && // Shift has started
          shiftEndDateTime < now // Shift has ended
        ) {
          try {
            if (isMounted) {
              await updateStatus({ scheduleId: shiftId, status: 'completed' });
            }
          } catch (err) {
            if (isMounted) {
              console.error('Failed to update shift status:', err);
            }
          }
        }
      };

      validateAndUpdateStatus();

      // Cleanup to prevent updates after unmount
      return () => {
        isMounted = false;
      };
    }, [
      nurseId,
      status,
      startDate,
      endDate,
      shiftId,
      openingShift,
      closingShift,
      updateStatus,
    ])
  );
};
