import { useNurse } from '@/components/context/nurse-context';
import { useToast } from '@/components/demos/toast';
import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { AnimatedSwitch } from '@/components/switch/AnimatedSwitch';

import { api } from '@/convex/_generated/api';
import { Text } from '@/features/shared/components/text';
import { Stack } from '@/features/shared/components/v-stack';

import { generateErrorMessage } from '@/features/shared/utils';
import { useMutation } from 'convex/react';
import { format } from 'date-fns';
import { useUnistyles } from 'react-native-unistyles';

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
  const { theme } = useUnistyles();
  const updateAvailability = async (value: boolean) => {
    if (!nurse?._id) return;
    if (!day.available && (!day.startTime || !day.endTime)) {
      showToast({
        title: 'Failed to update availability',

        subtitle: 'Please set start and end shift first',
      });
      return;
    }
    try {
      await updateAvailabilityMutation({
        nurseId: nurse?._id,
        day: day.day,
        available: value,
      });
      showToast({
        title: 'Success',
        subtitle: 'Availability updated',
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to update availability'
      );

      showToast({
        title: 'Error',
        subtitle: errorMessage,
      });
    }
  };
  const timeIsSet = !!day.startTime && !!day.endTime;
  return (
    <Stack
      mode="flex"
      backgroundColor={theme.colors.cardGrey}
      borderRadius={'md'}
      padding={'md'}
    >
      <Stack>
        <Text size={'normal'} style={{ fontFamily: 'PublicSansBold' }}>
          {day.day}
        </Text>
        {!day.startTime || !day.endTime ? (
          <Text>--</Text>
        ) : (
          <Text size={'small'}>
            {' '}
            {format(day.startTime, 'h:mm a')} - {format(day.endTime, 'h:mm a')}
          </Text>
        )}
      </Stack>
      <Stack gap="sm">
        <AnimatedSwitch
          value={day.available}
          onValueChange={updateAvailability}
          width={40}
          height={20}
        />
        <PrivacyNoticeLink onPress={onPress}>
          {timeIsSet ? 'Edit' : 'Set time'}
        </PrivacyNoticeLink>
      </Stack>
    </Stack>
  );
};
