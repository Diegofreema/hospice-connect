import { useHospice } from '@/components/context/hospice-context';
import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { StepperComponent } from '@/features/shared/components/stepper';
import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';
import { useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { RenderShifts } from './render-shifts';

export const ExtendAssignment = () => {
  const { id } = useLocalSearchParams<{ id: Id<'assignments'> }>();
  const { hospice } = useHospice();
  const [count, setCount] = useState(1);

  //   const { theme } = useUnistyles();
  const data = useQuery(
    api.shifts.getShifts,
    hospice && hospice._id && id
      ? { assignmentId: id, hospiceId: hospice._id }
      : 'skip',
  );

  if (data === undefined) {
    return <SmallLoader size={50} />;
  }
  const shiftsWithoutEnded = data?.shifts.filter(
    (shift) => shift.status !== 'ended' && shift.status !== 'cancelled',
  );
  const lastShift = shiftsWithoutEnded?.[shiftsWithoutEnded.length - 1];

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View pt="xl" gap="md" mt="lg">
        <Text style={styles.subtitle}>
          How many extra shifts would you like to add?
        </Text>
        <StepperComponent count={count} setCount={setCount} />
        <RenderShifts lastShift={lastShift} count={count} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create((theme) => ({
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
}));
