import { ControlInput } from '@/features/authentication/components/form/control-input';
import { Button } from '@/features/shared/components/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { ControlledDatePicker } from '@/features/authentication/components/form/control-date-picker';
import { ControlSelect } from '@/features/authentication/components/form/control-select';
import { usStates } from '@/features/nurse/data';
import View from '@/features/shared/components/view';
import { useEffect } from 'react';
import {
  createAssignmentValidator,
  CreateAssignmentValidator,
} from '../validator';
const careLevel = [
  'Initial Evaluation',
  'Follow Up',
  'Continuous Care',
  'Supervision',
  'Recertification',
  'Discharge',
];
type Props = {
  onSubmit: (data: CreateAssignmentValidator) => void;
};
export const CreateAssignmentForm = ({ onSubmit }: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<CreateAssignmentValidator>({
    defaultValues: {
      additionalNotes: '',
      address: '',
      dateOfBirth: new Date(),
      discipline: 'RN',
      endDate: new Date(),
      firstName: '',
      gender: 'male',
      lastName: '',
      phoneNumber: '',
      rate: '',
      startDate: new Date(),
      state: '',
      openShift: new Date(),
    },
    resolver: zodResolver(createAssignmentValidator),
  });

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <View gap={'m'}>
      <ControlInput
        control={control}
        errors={errors}
        name="phoneNumber"
        keyboardType="phone-pad"
        label="Phone number"
        placeholder="Enter your phone number"
      />
      <ControlInput
        control={control}
        errors={errors}
        name="firstName"
        label="First name"
        placeholder="John"
      />
      <ControlInput
        control={control}
        errors={errors}
        name="lastName"
        label="Last name"
        placeholder="Doe"
      />
      <ControlSelect
        control={control}
        errors={errors}
        name="gender"
        label="Gender"
        placeholder="Select gender"
        items={[
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Other', value: 'other' },
        ]}
      />

      <ControlledDatePicker
        control={control}
        errors={errors}
        name="dateOfBirth"
        label="Date of birth"
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
      <ControlSelect
        control={control}
        errors={errors}
        name="careLevel"
        label="Care level"
        placeholder="Select care level"
        items={careLevel.map((level) => ({ label: level, value: level }))}
      />

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
      <ControlInput
        control={control}
        errors={errors}
        name="address"
        label="Patient's address"
        placeholder="123 Main Street, Anytown, USA"
        variant="textarea"
      />
      <ControlSelect
        control={control}
        errors={errors}
        name="state"
        label="State"
        placeholder="Select a state"
        items={usStates}
      />

      <ControlInput
        control={control}
        errors={errors}
        name="additionalNotes"
        label="Additional notes"
        placeholder="Enter any additional notes"
        variant="textarea"
      />
      <Button
        label="Create"
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      />
    </View>
  );
};
