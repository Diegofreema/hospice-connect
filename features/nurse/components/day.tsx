import { useNurse } from '@/components/context/nurse-context';
import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { AnimatedSwitch } from '@/components/switch/AnimatedSwitch';
import { api } from '@/convex/_generated/api';
import Text from '@/features/shared/components/text';
import View from '@/features/shared/components/view';
import { generateErrorMessage } from '@/features/shared/utils';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from 'convex/react';
import { format } from 'date-fns';

type Props = {
  day: {
    startTime?: number | undefined;
    endTime?: number | undefined;
    available: boolean;
    day:
      | 'Monday'
      | 'Tuesday'
      | 'Wednesday'
      | 'Thursday'
      | 'Friday'
      | 'Saturday'
      | 'Sunday';
  };
  onPress: () => void;
};

export const Day = ({ day, onPress }: Props) => {
  const updateAvailabilityMutation = useMutation(
    api.nurses.updateNurseDailyAvailability
  );
  const { nurse } = useNurse();
  const { showToast } = useToast();
  const updateAvailability = async (value: boolean) => {
    if (!nurse?._id) return;
    try {
      await updateAvailabilityMutation({
        nurseId: nurse?._id,
        day: day.day,
        available: value,
      });
      showToast({
        title: 'Success',
        description: 'Availability updated',
        type: 'success',
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to update availability'
      );

      showToast({
        title: 'Error',
        description: errorMessage,
        type: 'error',
      });
    }
  };
  const timeIsSet = !!day.startTime && !!day.endTime;
  return (
    <View
      flexDirection={'row'}
      justifyContent={'space-between'}
      backgroundColor={'cardBackground'}
      borderRadius={8}
      padding={'m'}
      alignItems={'center'}
    >
      <View>
        <Text variant={'body'} style={{ fontFamily: 'PublicSansBold' }}>
          {day.day}
        </Text>
        {!day.startTime || !day.endTime ? (
          <Text>--</Text>
        ) : (
          <Text variant={'small'}>
            {' '}
            {format(day.startTime, 'h:mm a')} - {format(day.endTime, 'h:mm a')}
          </Text>
        )}
      </View>
      <View gap="s">
        <AnimatedSwitch
          value={day.available}
          onValueChange={updateAvailability}
          width={40}
          height={20}
        />
        <PrivacyNoticeLink onPress={onPress}>
          {timeIsSet ? 'Edit' : 'Set time'}
        </PrivacyNoticeLink>
      </View>
    </View>
  );
};
