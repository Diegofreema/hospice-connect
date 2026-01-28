import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Button } from '@/features/shared/components/button';
import { ReviewStar } from '@/features/shared/components/review-stars';
import { Text } from '@/features/shared/components/text';
import { generateErrorMessage } from '@/features/shared/utils';
import { useMutation, useQuery } from 'convex/react';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useGetScheduleId } from '../hooks/use-get-schedule-id';

type Props = {
  onClose: () => void;
};
export const RateNurse = ({ onClose }: Props) => {
  const scheduleId = useGetScheduleId((state) => state.id);
  const rateNurse = useMutation(api.nurses.rateNurse);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const shift = useQuery(
    api.shifts.getShift,
    scheduleId ? { scheduleId } : 'skip',
  );
  const onRate = async () => {
    if (!shift?.nurseId) return;
    setLoading(true);

    try {
      await rateNurse({ rate: rating, nurseId: shift.nurseId });
      showToast({
        title: 'Success',
        subtitle: 'Nurse rated successfully',
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(error, 'Failed to rate nurse');
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setLoading(false);
      onClose();
    }
  };
  const [rating, setRating] = useState(0);
  const { width } = useWindowDimensions();
  const size = width * 0.13;
  if (!shift) return null;
  return (
    <View style={{ gap: 5, marginTop: 30, flex: 1 }}>
      <View style={styles.header}>
        <View style={styles.imageContainer(size)}>
          <Image style={styles.image} source={shift.nurse?.image} />
        </View>
        <View>
          <Text size="normal" isBold>
            {shift.nurse?.name || 'No nurse assigned'}
          </Text>
          <Text size="normal" isBold>
            {format(shift.startDate, 'PPP')} - {format(shift.endDate, 'PPP')}
          </Text>
          <Text size="small">
            {shift.startTime} - {shift.endTime}
          </Text>
        </View>
      </View>
      <Text isMedium>What was your experience with this nurse?</Text>
      <ReviewStar fontSize={40} rating={rating} onRatingChange={setRating} />
      <Button
        title="Submit Review"
        style={{ marginTop: 30 }}
        disabled={loading}
        onPress={onRate}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  imageContainer: (size: number) => ({
    width: size,
    height: size,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: theme.colors.grey,
  }),
  image: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: theme.colors.cardGrey,
  },
  header: {
    flexDirection: 'row',

    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.cardGrey,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,

    width: '100%',
  },
  right: {
    gap: 5,
  },
}));
