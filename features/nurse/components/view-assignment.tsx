import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { FlexButtons } from '@/features/shared/components/flex-buttons';
import { FlexText } from '@/features/shared/components/flex-text';
import { NotFound } from '@/features/shared/components/not-found';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { Text } from '@/features/shared/components/text';
import { useAcceptDecline } from '@/features/shared/hooks/use-accept-decline';

import { trimText } from '@/features/shared/utils';
import { useQuery } from 'convex/react';
import { format, parse } from 'date-fns';
import { View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

type Props = {
  id: Id<'schedules'>;
  nurseId: Id<'nurses'>;
  nurseNotificationId: Id<'nurseNotifications'>;
};

export const ViewAssignment = ({ id, nurseId, nurseNotificationId }: Props) => {
  const { onAccept, onDecline, processing } = useAcceptDecline({
    scheduleId: id,
    nurseId,
    nurseNotificationId,
  });
  const assignment = useQuery(api.posts.getPost, {
    scheduleId: id,
    nurseNotificationId,
  });

  if (assignment === undefined) {
    return <SmallLoader size={50} />;
  }

  if (assignment === null) {
    return <NotFound description="Could not find this assignment" />;
  }

  const { assignment: post, hospice, schedule, nurseNotification } = assignment;
  const name = post.patientFirstName + ' ' + post.patientLastName;

  const startDate = parse(schedule.startDate, 'dd-MM-yyyy', new Date());
  const endDate = parse(schedule.endDate, 'dd-MM-yyyy', new Date());
  const dob = parse(post.dateOfBirth, 'dd-MM-yyyy', new Date());
  const showActions =
    !!nurseNotification &&
    nurseNotification.status !== 'accepted' &&
    nurseNotification.status !== 'declined';

  const isDeclined = nurseNotification?.status === 'declined';
  const isAccepted = nurseNotification?.status === 'accepted';
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <FlexText leftText="Business name" rightText={hospice.businessName} />
        <FlexText leftText="Patient name" rightText={name} />
        <FlexText leftText="Phone number" rightText={post.phoneNumber} />
        <FlexText leftText="Start date" rightText={format(startDate, 'PP')} />
        <FlexText leftText="End date" rightText={format(endDate, 'PP')} />
        <FlexText leftText="Open Shift" rightText={schedule.startTime} />
        <FlexText leftText="Close Shift" rightText={schedule.endTime} />
        <FlexText leftText="Date of birth" rightText={format(dob, 'PP')} />
        <FlexText leftText="Care level" rightText={post.careLevel} />
        <FlexText leftText="Gender" rightText={post.gender} />
        <FlexText leftText="Discipline" rightText={post.discipline} />
        <FlexText
          leftText="Location"
          rightText={trimText(post.patientAddress, 20)}
        />
      </View>
      <View style={styles.footer}>
        {showActions && (
          <FlexButtons
            onCancel={onDecline}
            onPress={onAccept}
            buttonText="Decline"
            buttonText2="Accept"
            disabled={processing}
            disabled2={processing}
          />
        )}
        {isDeclined && (
          <Text size="medium" color="red" isBold textAlign="center">
            Declined
          </Text>
        )}
        {isAccepted && (
          <Text size="medium" color="green" isBold textAlign="center">
            Accepted
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.greyLight,
    padding: theme.paddings.xl,
    gap: theme.gap.xl,
  },
  header: {
    gap: theme.gap.xl,
  },
  trigger: {
    padding: 5,
    borderRadius: 5,
  },
  content: {
    gap: 10,
    padding: theme.paddings.lg,
    backgroundColor: theme.colors.white,
    borderRadius: 10,
  },
  footer: {
    marginTop: 10,
  },
  viewSchedule: {
    padding: 5,
    borderRadius: 5,
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.cardGrey,
  },
  assign: {
    padding: 5,
    borderRadius: 5,
    flex: 1,
    backgroundColor: theme.colors.blue,
  },
  button: {
    padding: 5,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
  },
}));
