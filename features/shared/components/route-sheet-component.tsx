import { type Doc } from '@/convex/_generated/dataModel';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet } from 'react-native-unistyles';
import {
  calculateTotalEarnings,
  calculateTotalHours,
  convertNumberToStringThenToNumber,
  reverseDateStringToMDY,
} from '../utils';
import { FlexButtons } from './flex-buttons';
import { FlexText } from './flex-text';
import { Table } from './table';
import { Text } from './text';
import { View } from './view';
import { ViewSignature } from './view-signature';

type Props = {
  hospiceName: string;
  hospiceAddress: string;
  nurse: Doc<'nurses'>;
  shifts: Doc<'schedules'>[];
  comment: string;
  signature: string;
  rate: number;
  handleSubmit: () => Promise<void> | void;
  onGoBack: () => void;
  patientName: string;
  careLevel: string;
  buttonText?: string;
  buttonText2?: string;
  disabled?: boolean;
  disabled2?: boolean;
  hideButtons?: boolean;
  showDebit?: boolean;
  date?: number;
  commission?: number;
  assignmentTimezone: string;
};
const headers = [
  'Date',
  'Patient Name',
  'Care level',
  'Time in',
  'Time out',
  'Hours worked',
  'Rate',
  'Amount',
];
export const RoustSheetComponent = ({
  comment,
  hospiceAddress,
  hospiceName,
  nurse,
  shifts,
  signature,
  rate,
  handleSubmit,
  onGoBack,
  careLevel,
  patientName,
  buttonText2 = 'Submit',
  buttonText = 'Back',
  disabled2,
  disabled,
  hideButtons,
  showDebit = true,
  date,
  commission,
  assignmentTimezone,
}: Props) => {
  const totalHours = calculateTotalHours(shifts, assignmentTimezone);

  const data = [
    ...shifts.map((shift) => [
      ` ${reverseDateStringToMDY(shift.startDate)} - ${reverseDateStringToMDY(
        shift.endDate,
      )}`,
      patientName,
      careLevel,
      shift.startTime,
      shift.endTime,
      calculateTotalHours([shift], assignmentTimezone).toFixed(2),
      shift.rate.toFixed(2),
      `$${(
        convertNumberToStringThenToNumber(
          calculateTotalHours([shift], assignmentTimezone),
        ) * shift.rate
      ).toFixed(2)}`,
    ]),
  ];

  const totalPay = calculateTotalEarnings(shifts, assignmentTimezone);

  return (
    <View gap={'xxl'}>
      <View gap="xl">
        <Image
          source={require('@/assets/images/hospice.png')}
          style={styles.image}
          contentFit="contain"
        />
        <Text isBold size="medium" textAlign="center">
          {hospiceName}
        </Text>
        <Text size="small" textAlign="center">
          {hospiceAddress}
        </Text>
        <Text textAlign="center">Route Sheet</Text>
        <FlexText
          leftText={`Staff Name: ${nurse.name}`}
          rightText={`Discipline: ${nurse.discipline}`}
        />
      </View>
      <Table headers={headers} data={data} />
      <View
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text size="medium" isBold>
          Total hours: {totalHours.toFixed(2)}
        </Text>
        <Text size="medium" isBold>
          Total pay : ${totalPay.toFixed(2)}
        </Text>
      </View>
      <Text size="normal" textAlign="center">
        I certify the foregoing to be a correct accounting of time worked and
        services performed
      </Text>
      <ViewSignature signature={signature} />

      {date && (
        <Text size="normal">Date: {format(date, 'MM/dd/yy HH:mm')}</Text>
      )}
      <Text size="normal">Comment: {comment}</Text>

      {!hideButtons && (
        <FlexButtons
          onPress={handleSubmit}
          onCancel={onGoBack}
          buttonText={buttonText}
          buttonText2={buttonText2}
          disabled2={disabled2}
          disabled={disabled}
        />
      )}

      {showDebit && commission && (
        <Text size="normal" isBold textAlign="center">
          By submitting I authorize HospiceConnect to charge {commission}% of
          the total pay on my card
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  image: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
}));
