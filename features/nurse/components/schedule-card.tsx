import { type Doc } from '@/convex/_generated/dataModel';
import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';
import {
  calculateCanceledAtDueToTimezone,
  calculateTotalHours,
  getTimezoneDifference,
  timeIsBeforeOrSameTime,
} from '@/features/shared/utils';
import { format, parse } from 'date-fns';
import { StyleSheet } from 'react-native-unistyles';
type ScheduleProps = {
  schedule: Doc<'schedules'>;
  timeZone?: string;
  nurseTimeZone?: string;
};

export const ScheduleCard = ({
  schedule,
  timeZone,
  nurseTimeZone,
}: ScheduleProps) => {
  const startDate = parse(schedule.startDate, 'dd-MM-yyyy', new Date());
  const endDate = parse(schedule.endDate, 'dd-MM-yyyy', new Date());
  const text = schedule.status === 'cancelled' ? 'Canceled At' : 'Ended At';
  const result = getTimezoneDifference(
    timeZone as string,
    nurseTimeZone as string,
  );
  const canceledAt = calculateCanceledAtDueToTimezone(
    result.hoursAhead > 0,
    schedule.canceledAt,
    result.difference_hours,
  ) as number;
  const totalHours = calculateTotalHours([{ ...schedule, canceledAt }]);

  const hoursWorked =
    schedule.canceledAt &&
    timeIsBeforeOrSameTime(schedule.canceledAt, startDate.getTime())
      ? '0.00'
      : totalHours.toFixed(2);

  return (
    <View gap="md" style={styles.container}>
      <View>
        <Text size="medium" isMedium>
          {format(startDate, 'MM/dd/yy')} - {format(endDate, 'MM/dd/yy')}
        </Text>
      </View>
      <View flexDirection="row">
        <Text>{schedule.startTime}</Text>
        <Text>-</Text>
        <Text>
          {schedule.endTime} ({hoursWorked}hrs)
        </Text>
      </View>
      {canceledAt && (
        <Text>
          {text}: {format(canceledAt, 'MM/dd/yy h:mm a')}
        </Text>
      )}
      <Text>Hourly Rate: ${schedule.rate.toString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.cardGrey,
    padding: theme.paddings.xl,
    borderRadius: 10,
  },
  card: {
    backgroundColor: theme.colors.cardGrey,
    padding: theme.paddings.xl,
    borderRadius: 10,
    gap: theme.gap.xl,
  },
  innerCard: {
    backgroundColor: theme.colors.white,
    padding: theme.paddings.xl,
    borderRadius: 10,
    gap: 10,
  },
  signature: {
    borderColor: theme.colors.cardGrey,
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
