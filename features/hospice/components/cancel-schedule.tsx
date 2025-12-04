import { useHospice } from '@/components/context/hospice-context';
import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { FlexButtons } from '@/features/shared/components/flex-buttons';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';
import { generateErrorMessage } from '@/features/shared/utils';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { useGetScheduleId } from '../hooks/use-get-schedule-id';

type Props = {
  onClose: () => void;
};
export const CancelSchedule = ({ onClose }: Props) => {
  const clearId = useGetScheduleId((state) => state.clear);
  const id = useGetScheduleId((state) => state.id);
  const { hospice } = useHospice();
  const cancelSchedule = useMutation(api.schedules.cancelSchedule);
  const schedule = useQuery(
    api.schedules.getSchedule,
    id
      ? {
          scheduleId: id,
        }
      : 'skip'
  );
  const [cancelling, setCanceling] = useState(false);
  const { showToast } = useToast();
  const onCancelSchedule = async () => {
    if (!id || !hospice || !hospice._id) return;
    setCanceling(true);
    const cancelledAt = Date.now();
    try {
      await cancelSchedule({
        scheduleId: id,
        hospiceId: hospice._id,
        cancelledAt,
      });
      showToast({
        title: 'Success',
        subtitle: 'Schedule cancelled successfully',
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to cancel schedule'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setCanceling(false);
      handleClose();
    }
  };
  const handleClose = () => {
    onClose();
    clearId();
  };
  if (!schedule) return <SmallLoader size={20} />;
  const text =
    schedule.status === 'on_going'
      ? 'This schedule is on-going. Are you sure you want to cancel it?'
      : 'This shift has not started, So it will be open for reassignment.';
  return (
    <View gap="md">
      <Text isMedium>{text}</Text>
      <FlexButtons
        onPress={onCancelSchedule}
        onCancel={handleClose}
        disabled={cancelling}
      />
    </View>
  );
};
