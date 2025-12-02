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
  status:
    | 'not_covered'
    | 'booked'
    | 'completed'
    | 'available'
    | 'cancelled'
    | 'on_going'
    | 'ended';
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
      if (status === 'cancelled' || status === 'ended') return;
      let isMounted = true;

      const validateAndUpdateStatus = async () => {
        // Validate inputs
        if (
          isNaN(startDate.getTime()) ||
          isNaN(endDate.getTime()) ||
          isNaN(openingShift.getTime()) ||
          isNaN(closingShift.getTime())
        ) {
          console.error('Invalid startDate or endDate');
          return;
        }

        const shiftStartDateTime = new Date(startDate);
        shiftStartDateTime.setHours(
          openingShift.getHours(),
          openingShift.getMinutes(),
          0,
          0
        );

        const shiftEndDateTime = new Date(endDate);
        shiftEndDateTime.setHours(
          closingShift.getHours(),
          closingShift.getMinutes(),
          0,
          0
        );
        const now = new Date();

        // Check if shift has ended (current time is past shift end)
        // AND there's no nurse assigned AND status is not already 'not_covered'
        if (
          !nurseId &&
          status !== 'not_covered' &&
          now >= shiftStartDateTime &&
          now > shiftEndDateTime
        ) {
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

      void validateAndUpdateStatus();

      return () => {
        isMounted = false;
      };
    }, [
      status,
      startDate,
      endDate,
      shiftId,
      updateStatus,
      nurseId,
      openingShift,
      closingShift,
    ])
  );
  useFocusEffect(
    useCallback(() => {
      if (status === 'cancelled' || status === 'ended') return;
      let isMounted = true;

      const validateAndUpdateStatus = async () => {
        // Validate dates
        if (
          isNaN(startDate.getTime()) ||
          isNaN(endDate.getTime()) ||
          isNaN(openingShift.getTime()) ||
          isNaN(closingShift.getTime())
        ) {
          console.error('Invalid date or time values');
          return;
        }

        const now = new Date();

        // Build full datetime for shift start/end
        const shiftStartDateTime = new Date(startDate);
        shiftStartDateTime.setHours(
          openingShift.getHours(),
          openingShift.getMinutes(),
          0,
          0
        );

        const shiftEndDateTime = new Date(endDate);
        shiftEndDateTime.setHours(
          closingShift.getHours(),
          closingShift.getMinutes(),
          0,
          0
        );

        // 1. Shift has STARTED → mark as 'ongoing' (if nurse assigned)
        if (
          nurseId &&
          status !== 'on_going' &&
          status !== 'completed' &&
          status !== 'not_covered' &&
          now >= shiftStartDateTime &&
          now < shiftEndDateTime
        ) {
          try {
            if (isMounted) {
              await updateStatus({
                scheduleId: shiftId,
                status: 'on_going',
              });
            }
          } catch (err) {
            if (isMounted) console.error('Failed to set ongoing:', err);
          }
          return;
        }

        // 2. Shift has ENDED + no nurse → mark as 'not_covered'
      };

      void validateAndUpdateStatus();

      return () => {
        isMounted = false;
      };
    }, [
      status,
      startDate,
      endDate,
      shiftId,
      openingShift,
      closingShift,
      nurseId,
      updateStatus,
    ])
  );

  useFocusEffect(
    useCallback(() => {
      if (status === 'cancelled' || status === 'ended') return;
      let isMounted = true; // Track component mount status

      const validateAndUpdateStatus = async () => {
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error('Invalid startDate or endDate');
          return;
        }

        // Combine date and time for shift start
        const shiftStartDateTime = new Date(startDate);
        shiftStartDateTime.setHours(
          openingShift.getHours(),
          openingShift.getMinutes(),
          0,
          0
        );

        // Combine date and time for shift end
        const shiftEndDateTime = new Date(endDate);
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

      void validateAndUpdateStatus();

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
