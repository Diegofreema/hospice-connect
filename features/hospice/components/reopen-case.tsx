import { useHospice } from '@/components/context/hospice-context';
import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import {
  generateErrorMessage,
  generateShiftsWithDateFns,
  timezone,
} from '@/features/shared/utils';
import { useMutation } from 'convex/react';
import { format } from 'date-fns';
import React from 'react';

import { ControlledDatePicker } from '@/features/authentication/components/form/control-date-picker';
import { ControlInput } from '@/features/authentication/components/form/control-input';
import { ControlSelect } from '@/features/authentication/components/form/control-select';
import BottomSheetKeyboardAwareScrollView from '@/features/shared/components/bottom-sheet-aware-scroll-view';
import { FlexButtons } from '@/features/shared/components/flex-buttons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSelectAssignment } from '../hooks/use-select-assignment';
import {
  reopenAssignmentValidator,
  type ReopenAssignmentValidator,
} from '../validator';

type Props = {
  onClose: () => void;
};

export const ReopenCase = ({ onClose }: Props) => {
  const id = useSelectAssignment((state) => state.id);
  const { showToast } = useToast();
  const { hospice } = useHospice();

  const reopenCase = useMutation(api.assignments.reopenAssignment);
  const hospiceTimezone = timezone();
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReopenAssignmentValidator>({
    defaultValues: {
      endDate: new Date(),

      startDate: new Date(),

      openShift: new Date(),
    },
    resolver: zodResolver(reopenAssignmentValidator),
  });
  const onSubmit = async (data: ReopenAssignmentValidator) => {
    if (!hospice) return;

    try {
      const shifts = generateShiftsWithDateFns({
        endDate: data.endDate,
        startDate: data.startDate,
        openShift: data.openShift,
      });
      await reopenCase({
        openShift: format(new Date(data.openShift), 'h:mm a'),
        startDate: format(new Date(data.startDate), 'dd-MM-yyyy'),
        endDate: format(new Date(data.endDate), 'dd-MM-yyyy'),
        hospiceId: hospice._id as Id<'hospices'>,
        assignmentId: id as Id<'assignments'>,
        shifts,
        discipline: data.discipline,
        hospiceTimezone,
        rate: Number(data.rate),
      });
      showToast({
        title: 'Success',
        subtitle: 'Case reopened successfully',
        autodismiss: true,
      });
      onClose();
      reset();
    } catch (error) {
      const errorMessage = generateErrorMessage(error, 'Failed to reopen case');

      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    }
  };
  return (
    <BottomSheetKeyboardAwareScrollView showsVerticalScrollIndicator={false}>
      <ControlledDatePicker
        control={control}
        errors={errors}
        name="startDate"
        label="Start date"
      />
      <ControlledDatePicker
        control={control}
        errors={errors}
        name="endDate"
        label="End date"
      />
      <ControlledDatePicker
        control={control}
        errors={errors}
        name="openShift"
        label="Open shift"
        mode="time"
      />
      <ControlSelect
        control={control}
        errors={errors}
        name="discipline"
        label="Discipline needed"
        placeholder="Select discipline"
        items={[
          { label: 'RN', value: 'RN' },
          { label: 'LVN', value: 'LVN' },
          { label: 'HHA', value: 'HHA' },
        ]}
      />
      <ControlInput
        control={control}
        errors={errors}
        name="rate"
        label="Rate"
        placeholder="Enter rate/hour"
        keyboardType="numeric"
      />
      <FlexButtons
        onPress={handleSubmit(onSubmit)}
        onCancel={onClose}
        buttonText2="Reopen"
        buttonText="Cancel"
        disabled2={isSubmitting}
        disabled={isSubmitting}
      />
    </BottomSheetKeyboardAwareScrollView>
  );
};
