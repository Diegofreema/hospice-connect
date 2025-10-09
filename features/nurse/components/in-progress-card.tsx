import { Card, CardContent, CardHeader } from '@/components/card';
import { Doc } from '@/convex/_generated/dataModel';
import { FlexText } from '@/features/shared/components/flex-text';
import { trimText } from '@/features/shared/utils';
import React from 'react';

import { useSelectAssignment } from '@/features/hospice/hooks/use-select-assignment';
import { FlexButtons } from '@/features/shared/components/flex-buttons';
import { format, parse } from 'date-fns';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  item: Doc<'assignments'> & { businessName?: string };
  onOpenSheet: () => void;
};

export const InProgressCard = ({ item: post, onOpenSheet }: Props) => {
  const setId = useSelectAssignment((state) => state.setId);
  const name = post.patientFirstName + ' ' + post.patientLastName;
  const startDate = parse(post.startDate, 'dd-MM-yyyy', new Date());
  const endDate = parse(post.endDate, 'dd-MM-yyyy', new Date());
  const dob = parse(post.dateOfBirth, 'dd-MM-yyyy', new Date());
  const handleAccept = () => {
    setId(post._id);
    onOpenSheet();
  };
  return (
    <Card style={styles.card}>
      <CardHeader style={styles.header}></CardHeader>
      <CardContent style={styles.content}>
        <FlexText
          leftText="Business name"
          rightText={post?.businessName || 'N/A'}
        />

        <FlexText leftText="Patient name" rightText={name} />
        <FlexText leftText="Phone number" rightText={post.phoneNumber} />
        <FlexText leftText="Start date" rightText={format(startDate, 'PP')} />
        <FlexText leftText="End date" rightText={format(endDate, 'PP')} />
        <FlexText leftText="Date of birth" rightText={format(dob, 'PP')} />
        <FlexText leftText="Care level" rightText={post.careLevel} />
        <FlexText leftText="Gender" rightText={post.gender} />
        <FlexText leftText="Discipline" rightText={post.discipline} />

        <FlexText
          leftText="Location"
          rightText={trimText(post.patientAddress, 20)}
        />

        <FlexButtons
          onPress={handleAccept}
          onCancel={() => {}}
          buttonText2="View schedule"
          buttonText="Message"
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
