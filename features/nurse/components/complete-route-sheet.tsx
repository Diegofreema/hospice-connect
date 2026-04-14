import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { type Doc, type Id } from '@/convex/_generated/dataModel';
import { ControlInput } from '@/features/authentication/components/form/control-input';
import { Button } from '@/features/shared/components/button';
import { FlexText } from '@/features/shared/components/flex-text';
import { KeyboardAwareScrollViewComponent } from '@/features/shared/components/key-board-aware-scroll-view';
import { RoustSheetComponent } from '@/features/shared/components/route-sheet-component';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { View } from '@/features/shared/components/view';
import { ViewSignature } from '@/features/shared/components/view-signature';
import { generateErrorMessage, trimText } from '@/features/shared/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';

import { useNurse } from '@/components/context/nurse-context';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  type Control,
  type FieldErrors,
  useForm,
  type UseFormSetValue,
} from 'react-hook-form';
import { FlatList } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { routeSheetValidator, type RouteSheetValidator } from '../validators';
import { ScheduleCard } from './schedule-card';
import { SignatureModal } from './signature-modal';

type Props = {
  nurseId: Id<'nurses'>;
  assignmentId: Id<'assignments'>;
};

export const CompleteRouteSheet = ({ assignmentId, nurseId }: Props) => {
  const data = useQuery(api.routeSheets.getDetailsForRouteSheet, {
    nurseId,
    assignmentId,
  });
  const { nurse } = useNurse();
  const commission = useQuery(api.adminSettings.getCommission);
  const submitRouteSheet = useMutation(api.routeSheets.submitRouteSheet);
  const { showToast } = useToast();
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
  const onSubmit = async (values: RouteSheetValidator) => {
    if (!data?.assignment) return;
    try {
      await submitRouteSheet({
        nurseId,
        assignmentId,
        scheduleIds: data.schedules.map((schedule) => schedule._id),
        signature: values.signature,
        comment: values.comment,
        hospiceId: data?.assignment.hospiceId,
      });
      showToast({
        title: 'Success',
        subtitle: 'Route sheet submitted successfully',
        autodismiss: true,
      });
      setShowRouteSheet(false);
      router.back();
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to submit route sheet',
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    }
  };
  if (data === undefined || commission === undefined) {
    return <SmallLoader size={50} />;
  }

  const onHideRouteSheet = () => setShowRouteSheet(false);
  const onShowRouteSheet = () => setShowRouteSheet(true);
  return (
    <KeyboardAwareScrollViewComponent>
      {showRouteSheet ? (
        <RoustSheetComponent
          commission={commission}
          nurse={data.nurse}
          shifts={data.schedules}
          comment={comment || ''}
          signature={signature}
          hospiceAddress={data.assignment.hospiceAddress}
          disabled2={isSubmitting}
          disabled={isSubmitting}
          rate={data.assignment.rate}
          hospiceName={data.assignment.businessName}
          assignmentTimezone={data.assignment.hospiceTimezone}
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
            renderItem={({ item }) => (
              <ScheduleCard
                schedule={item}
                timeZone={data.assignment.hospiceTimezone}
                nurseTimeZone={nurse?.nurseTimezone}
              />
            )}
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
    </KeyboardAwareScrollViewComponent>
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
          leftText={`Staff Name: ${trimText(nurse.name, 15)}`}
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
  const [visible, setVisible] = useState(false);

  const onOK = (signature: string) => {
    setValue('signature', signature);
  };
  const onClear = () => {
    setValue('signature', '');
  };
  const onClose = () => {
    setVisible(false);
  };
  return (
    <View gap="xl">
      <View gap="xl">
        <Button title="Tap here to sign" onPress={() => setVisible(true)} />
        {signature && <ViewSignature signature={signature} />}
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
      <SignatureModal
        errors={errors}
        onClear={onClear}
        onClose={onClose}
        onOK={onOK}
        signature={signature}
        visible={visible}
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
    borderColor: theme.colors.cardGrey,
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
