import { Card, CardContent, CardHeader } from '@/components/card';
import { FlexText } from '@/features/shared/components/flex-text';
import {
  calculateAge,
  changeFirstLetterToCapital,
} from '@/features/shared/utils';
import React from 'react';

import { useNurse } from '@/components/context/nurse-context';
import { api } from '@/convex/_generated/api';
import { useUpdateToNotCompleted } from '@/features/nurse/hooks/use-update-to-not-completed';
import { FlexButtons } from '@/features/shared/components/flex-buttons';
import { LongInfo } from '@/features/shared/components/long-info';
import { useMessage } from '@/hooks/use-message';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';
import { format, parse } from 'date-fns';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  item: FunctionReturnType<
    typeof api.assignments.completedAssignments
  >['page'][number];
};

export const CompletedCard = ({ item: post }: Props) => {
  const { nurse } = useNurse();
  const name = post.patientFirstName + ' ' + post.patientLastName;
  const startDate = parse(post.startDate, 'dd-MM-yyyy', new Date());
  const endDate = parse(post.endDate, 'dd-MM-yyyy', new Date());
  const dob = parse(post.dateOfBirth, 'dd-MM-yyyy', new Date());
  useUpdateToNotCompleted({ assignmentId: post._id, nurseId: nurse?._id! });
  const hasSubmitted = useQuery(api.routeSheets.nurseSubmittedRouteSheet, {
    nurseId: nurse?._id!,
    assignmentId: post._id,
  });
  const { onMessage } = useMessage({ userToChat: post.hospice?.userId! });

  const onHandleRouteSheet = () => {
    const path = !hasSubmitted
      ? '/complete-route-sheet'
      : '/view-route-sheet-nurse';

    router.push(`${path}?assignmentId=${post._id}&nurseId=${nurse?._id}`);
  };
  console.log(post.isSubmitted, post.patientFirstName);

  const buttonText = hasSubmitted ? 'View route sheet' : 'Complete route sheet';
  const disableButton = post.isSubmitted && !post.isApproved;
  return (
    <Card style={styles.card}>
      <CardHeader style={styles.header}></CardHeader>
      <CardContent style={styles.content}>
        <FlexText
          leftText="Business name"
          rightText={post?.hospice?.businessName || 'N/A'}
        />

        <FlexText leftText="Patient name" rightText={name} />
        <FlexText leftText="Phone number" rightText={post.phoneNumber} />
        <FlexText
          leftText="Start date"
          rightText={format(startDate, 'MM/dd/yy')}
        />
        <FlexText leftText="End date" rightText={format(endDate, 'MM/dd/yy')} />
        <FlexText
          leftText="Date of birth"
          rightText={`${format(dob, 'MM/dd/yy')} (${calculateAge(dob).toString()})`}
        />
        <FlexText leftText="Care level" rightText={post.careLevel} />
        <FlexText
          leftText="Gender"
          rightText={changeFirstLetterToCapital(post.gender)}
        />
        <FlexText leftText="Discipline" rightText={post.discipline} />

        {/*<FlexText leftText="Location" rightText={post.patientAddress} />*/}
        <LongInfo title={'Address'} description={post.patientAddress} />
        {post.zipcode && (
          <FlexText leftText="Zipcode" rightText={post.zipcode} />
        )}
        {post.notes && (
          <LongInfo title={'Additional notes'} description={post.notes} />
        )}

        <FlexButtons
          onPress={onHandleRouteSheet}
          onCancel={onMessage}
          buttonText2={buttonText}
          buttonText="Message"
          disabled={disableButton}
        />
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.greyLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trigger: {
    padding: 5,
    borderRadius: 5,
  },
  content: {
    gap: 10,
    marginTop: -10,
    borderRadius: 15,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
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
