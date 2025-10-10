import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { ControlInput } from '@/features/authentication/components/form/control-input';
import { Button } from '@/features/shared/components/button';
import { CustomPressable } from '@/features/shared/components/custom-pressable';
import { FlexText } from '@/features/shared/components/flex-text';
import { RoustSheetComponent } from '@/features/shared/components/route-sheet-component';
import SignatureComponent from '@/features/shared/components/signature-component';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';
import { ViewSignature } from '@/features/shared/components/view-signature';
import { trimText } from '@/features/shared/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from 'convex/react';
import { format, parse } from 'date-fns';
import React, { useRef, useState } from 'react';
import {
  Control,
  FieldErrors,
  useForm,
  UseFormSetValue,
} from 'react-hook-form';
import { FlatList, ScrollView } from 'react-native';
import { SignatureViewRef } from 'react-native-signature-canvas';
import { StyleSheet } from 'react-native-unistyles';
import { routeSheetValidator, RouteSheetValidator } from '../validators';

type Props = {
  nurseId: Id<'nurses'>;
  assignmentId: Id<'assignments'>;
};

export const CompleteRouteSheet = ({ assignmentId, nurseId }: Props) => {
  const data = useQuery(api.routeSheets.getDetailsForRouteSheet, {
    nurseId,
    assignmentId,
  });
  const [showRouteSheet, setShowRouteSheet] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<RouteSheetValidator>({
    resolver: zodResolver(routeSheetValidator),
    defaultValues: {
      signature: '',
      comment: '',
    },
  });

  const signature = watch('signature');

  const comment = watch('comment');
  const onSubmit = async (data: RouteSheetValidator) => {};
  if (data === undefined) {
    return <SmallLoader size={50} />;
  }

  const onHideRouteSheet = () => setShowRouteSheet(false);
  const onShowRouteSheet = () => setShowRouteSheet(true);
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {showRouteSheet ? (
        <RoustSheetComponent
          nurse={data.nurse}
          shifts={data.schedules}
          comment={comment || ''}
          signature={signature}
          hospiceAddress={data.assignment.hospiceAddress}
          rate={data.assignment.rate}
          hospiceName={data.assignment.businessName}
          handleSubmit={handleSubmit(onSubmit)}
          onGoBack={onHideRouteSheet}
          careLevel={data.assignment.careLevel}
          patientName={
            data.assignment.patientFirstName +
            ' ' +
            data.assignment.patientLastName
          }
        />
      ) : (
        <>
          <FlatList
            ListHeaderComponent={() => (
              <Header assignment={data.assignment} nurse={data.nurse} />
            )}
            data={data.schedules}
            renderItem={({ item }) => <ScheduleCard schedule={item} />}
            contentContainerStyle={{ paddingBottom: 50, gap: 25 }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
          <Bottom
            control={control}
            errors={errors}
            isSubmitting={isSubmitting}
            setValue={setValue}
            onShowRouteSheet={onShowRouteSheet}
            signature={signature}
          />
        </>
      )}
    </ScrollView>
  );
};

type ScheduleProps = {
  schedule: Doc<'schedules'>;
};

const ScheduleCard = ({ schedule }: ScheduleProps) => {
  const startDate = parse(schedule.startDate, 'dd-MM-yyyy', new Date());
  const endDate = parse(schedule.endDate, 'dd-MM-yyyy', new Date());

  return (
    <View gap="md" style={styles.container}>
      <View>
        <Text size="medium" isMedium>
          {format(startDate, 'PP')} - {format(endDate, 'PP')}
        </Text>
      </View>
      <View flexDirection="row">
        <Text>{schedule.startTime}</Text>
        <Text>-</Text>
        <Text>{schedule.endTime} (12hrs)</Text>
      </View>
    </View>
  );
};

type HeaderProps = {
  nurse: Doc<'nurses'>;
  assignment: Doc<'assignments'> & {
    businessName?: string;
  };
};

const Header = ({ assignment, nurse }: HeaderProps) => {
  return (
    <View style={styles.card}>
      <View px="lg">
        <FlexText
          leftText={`Staff Name: ${nurse.firstName} ${nurse.lastName}`}
          rightText={`Discipline: ${nurse.discipline}`}
        />
      </View>
      <View style={styles.innerCard}>
        <FlexText
          leftText="Hospice name"
          rightText={assignment.businessName || 'N/A'}
        />
        <FlexText
          leftText="Address"
          rightText={trimText(assignment.patientAddress, 25)}
        />
        <FlexText
          leftText="Patient name"
          rightText={
            assignment.patientFirstName + ' ' + assignment.patientLastName
          }
        />
        <FlexText leftText="Phone number" rightText={assignment.phoneNumber} />
        <FlexText leftText="Care Level" rightText={assignment.careLevel} />
        <FlexText
          leftText="Hourly Rate"
          rightText={`$${assignment.rate.toString()}`}
        />
      </View>
    </View>
  );
};

type BottomProps = {
  control: Control<RouteSheetValidator>;
  errors: FieldErrors<RouteSheetValidator>;

  isSubmitting: boolean;

  setValue: UseFormSetValue<RouteSheetValidator>;
  onShowRouteSheet: () => void;
  signature: string;
};
const Bottom = ({
  control,
  errors,

  isSubmitting,
  setValue,
  onShowRouteSheet,
  signature,
}: BottomProps) => {
  const ref = useRef<SignatureViewRef>(null);
  const onOK = (signature: string) => {
    setValue('signature', signature);
  };
  const onClear = () => {
    setValue('signature', '');
  };
  return (
    <View gap="xxl">
      <View>
        <Text size="normal">Signature</Text>
        {signature ? (
          <>
            <ViewSignature signature={signature} />
            <CustomPressable onPress={onClear} style={styles.retake}>
              <Text size="normal" isBold>
                Retake
              </Text>
            </CustomPressable>
          </>
        ) : (
          <>
            <SignatureComponent ref={ref} onOK={onOK} onClear={onClear} />
            {errors.signature?.message && (
              <Text size="small" color={'red'}>
                {typeof errors['signature']?.message === 'string'
                  ? errors['signature']?.message
                  : 'Invalid input'}
              </Text>
            )}
          </>
        )}
      </View>
      <ControlInput
        variant="textarea"
        control={control}
        errors={errors}
        name="comment"
        placeholder="Write your comments here"
        label="Comments"
      />
      <Button
        title="Generate Route Sheet"
        onPress={onShowRouteSheet}
        disabled={isSubmitting || !signature}
      />
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
    width: '100%',
    height: '100%',
  },
  signatureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    height: 200,
    backgroundColor: theme.colors.cardGrey,
    borderRadius: 10,
    alignSelf: 'center',
  },
  retake: {
    alignSelf: 'center',
    marginTop: 10,
  },
}));
