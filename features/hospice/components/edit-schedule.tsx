import { useToast } from '@/components/demos/toast';
import { ControlledDatePicker } from '@/features/authentication/components/form/control-date-picker';
import { FlexButtons } from '@/features/shared/components/flex-buttons';

import { useHospice } from '@/components/context/hospice-context';
import { api } from '@/convex/_generated/api';
import { ControlInput } from '@/features/authentication/components/form/control-input';
import {
  convertTimeStringToDate,
  generateErrorMessage,
} from '@/features/shared/utils';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { FunctionReturnType } from 'convex/server';
import { format, parse } from 'date-fns';
import { useForm } from 'react-hook-form';
import { useGetScheduleId } from '../hooks/use-get-schedule-id';
import { editScheduleValidator, EditScheduleValidator } from '../validator';

type Props = {
  onClose: () => void;
  initialValues: FunctionReturnType<typeof api.schedules.getSchedule>;
};

export const EditSchedule = ({ onClose, initialValues }: Props) => {
  const { showToast } = useToast();
  const scheduleId = useGetScheduleId((state) => state.id);
  const { hospice } = useHospice();
  const editSchedule = useMutation(api.schedules.editSchedule);

  const clearId = useGetScheduleId((state) => state.clear);

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditScheduleValidator>({
    resolver: zodResolver(editScheduleValidator),
    defaultValues: {
      startDate: parse(initialValues?.startDate!, 'dd-MM-yyyy', new Date()),
      endDate: parse(initialValues?.endDate!, 'dd-MM-yyyy', new Date()),
      openShift: convertTimeStringToDate(initialValues?.startTime!),
      endShift: convertTimeStringToDate(initialValues?.endTime!),
      rate: initialValues?.rate.toString(),
    },
  });

  const onSubmit = async (data: EditScheduleValidator) => {
    if (!hospice || !scheduleId || !hospice._id) return;
    try {
      await editSchedule({
        startDate: format(data.startDate, 'dd-MM-yyyy'),
        endDate: format(data.endDate, 'dd-MM-yyyy'),
        startTime: format(data.openShift, 'h:mm a'),
        endTime: format(data.endShift, 'h:mm a'),
        scheduleId,
        hospiceId: hospice?._id,
        rate: Number(data.rate),
      });

      showToast({
        title: 'Success',
        subtitle: 'Schedule edited successfully',
        autodismiss: true,
      });
      handleClose();
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to edit schedule'
      );

      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    }
  };

  const handleClose = () => {
    onClose();
    clearId();
  };
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 20, paddingBottom: 100 }}
    >
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
        label="Start Time"
        mode="time"
      />
      <ControlledDatePicker
        control={control}
        errors={errors}
        name="endShift"
        label="End Time"
        mode="time"
      />
      <ControlInput
        control={control}
        errors={errors}
        name="rate"
        placeholder="Enter rate"
        label="Rate"
        keyboardType="numeric"
      />
      <FlexButtons
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        onCancel={handleClose}
        buttonText="Cancel"
        buttonText2="Apply"
      />
    </BottomSheetScrollView>
  );
};
