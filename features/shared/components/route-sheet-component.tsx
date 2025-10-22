import { Doc } from '@/convex/_generated/dataModel';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet } from 'react-native-unistyles';
import { calculateTotalHours } from '../utils';
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
  handleSubmit: () => Promise<void>;
  onGoBack: () => void;
  patientName: string;
  careLevel: string;
  buttonText?: string;
  buttonText2?: string;
  disabled?: boolean;
  disabled2?: boolean;
  hideButtons?: boolean;
  showDebit?: boolean;
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
}: Props) => {
  const totalHours = calculateTotalHours(shifts);
  const data = [
    ...shifts.map((shift) => [
      ` ${shift.startDate} - ${shift.endDate}`,
      patientName,
      careLevel,
      shift.startTime,
      shift.endTime,
      calculateTotalHours([shift]).toFixed(2),
      rate.toFixed(2),
      `$${(calculateTotalHours([shift]) * rate).toFixed(2)}`,
    ]),
  ];
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
          leftText={`Staff Name: ${nurse.firstName} ${nurse.lastName}`}
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
          Total pay : ${Number(totalHours.toFixed(2)) * rate}
        </Text>
      </View>
      <Text size="normal" textAlign="center">
        I certify the foregoing to be a correct accounting of time worked and
        services performed
      </Text>
      <ViewSignature signature={signature} />
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
      {showDebit && (
        <Text size="normal" isBold textAlign="center">
          By submitting I authorize HospiceConnect to charge 5% of the total pay
          on my card
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  image: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
}));
