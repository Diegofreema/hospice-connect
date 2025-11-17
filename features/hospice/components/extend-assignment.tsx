import { useHospice } from '@/components/context/hospice-context';
import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { StepperComponent } from '@/features/shared/components/stepper';
import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';
import {
  convertTimeStringToDate,
  generateErrorMessage,
  reverseDateString,
} from '@/features/shared/utils';
import { useMutation, useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';
import { addHours, format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ExtendShiftCard } from './extend-shift-card';
import { LatestShiftCard } from './latetest-shift-card';

interface Shift {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  startISO: Date;
  endISO: Date;
}
type ShiftCardType = FunctionReturnType<
  typeof api.shifts.getShifts
>['shifts'][number];
const splitShift = (start: Date, end: Date): Shift => {
  const startDate = format(start, 'yyyy-MM-dd');
  const endDate = format(end, 'yyyy-MM-dd');
  const startTime = format(start, 'HH:mm');
  const endTime = format(end, 'HH:mm');

  return {
    startDate,
    endDate,
    startTime,
    endTime,
    startISO: start,
    endISO: end,
  };
};
export const ExtendAssignment = () => {
  const { id } = useLocalSearchParams<{ id: Id<'assignments'> }>();
  const { hospice } = useHospice();
  const [count, setCount] = useState(1);

  //   const { theme } = useUnistyles();
  const data = useQuery(
    api.shifts.getShifts,
    hospice && hospice._id && id
      ? { assignmentId: id, hospiceId: hospice._id }
      : 'skip'
  );

  if (data === undefined) {
    return <SmallLoader size={50} />;
  }
  const lastShift = data?.shifts[data?.shifts.length - 1];

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
type HeaderProps = {
  shift: ShiftCardType;
};
const Header = ({ shift }: HeaderProps) => {
  return (
    <View
      gap="lg"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        paddingBottom: 20,
      }}
    >
      <Text size="medium" isBold>
        Last shift
      </Text>
      <LatestShiftCard shift={shift} />
    </View>
  );
};

type RenderShiftsProps = {
  lastShift: ShiftCardType;

  count: number;
};

const RenderShifts = ({
  lastShift,

  count,
}: RenderShiftsProps) => {
  const { hospice } = useHospice();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const extendAssignment = useMutation(api.shifts.extendAssignment);
  const lastShiftEndTime = convertTimeStringToDate(
    lastShift?.endTime as string
  );
  const lastShiftEndDate = lastShift?.endDate
    ?.split('-')
    ?.reverse()
    ?.join('-') as string;
  console.log(lastShift?.endDate);

  const extraShifts: Shift[] = useMemo(() => {
    const [year, month, day] = lastShiftEndDate.split('-').map(Number);
    console.log({ day, month, year });

    const baseDate = new Date(year, month - 1, day);
    baseDate.setHours(
      lastShiftEndTime.getHours(),
      lastShiftEndTime.getMinutes(),
      0,
      0
    );

    const list: Shift[] = [];
    let cursor = new Date(baseDate);
    console.log(baseDate);
    // clone

    for (let i = 0; i < count; i++) {
      const end = addHours(cursor, 12); // 12-hour shift

      list.push(splitShift(cursor, end));

      cursor = end; // next shift starts where this one ends
    }
    return list;
  }, [count, lastShiftEndDate, lastShiftEndTime]);
  const formattedShifts: Partial<ShiftCardType>[] = extraShifts.map(
    (shift) => ({
      _creationTime: shift.startISO.getTime(),
      status: 'available',
      endDate: shift.endDate,
      startTime: shift.startTime,
      endTime: shift.endTime,
      startDate: shift.startDate,
      rate: lastShift?.rate,
    })
  );

  const handleSubmit = async () => {
    if (!hospice) return;
    setLoading(true);
    try {
      const shifts = formattedShifts.map((shift) => ({
        start: reverseDateString(shift.startDate!),
        end: reverseDateString(shift.endDate!),
        startShift: format(convertTimeStringToDate(shift.startTime!), 'h:mm a'),
        endShift: format(convertTimeStringToDate(shift.endTime!), 'h:mm a'),
      }));
      await extendAssignment({
        assignmentId: lastShift?.assignmentId,
        shifts,
        hospiceId: hospice._id!,
      });

      showToast({
        title: 'Success',
        subtitle: 'Assignment extended successfully',
        autodismiss: true,
      });
      router.dismiss();
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to extend assignment'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlatList
      ListHeaderComponent={<Header shift={lastShift} />}
      data={formattedShifts}
      renderItem={({ item }) => <ExtendShiftCard shift={item} />}
      contentContainerStyle={{ gap: 20 }}
      scrollEnabled={false}
      ListFooterComponent={
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Add Extra Shifts</Text>
        </TouchableOpacity>
      }
    />
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  button: {
    backgroundColor: theme.colors.button,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}));
