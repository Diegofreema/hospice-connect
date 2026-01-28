import { ControlledDatePicker } from '@/features/authentication/components/form/control-date-picker';
import { ControlInput } from '@/features/authentication/components/form/control-input';
import { ControlSelect } from '@/features/authentication/components/form/control-select';
import { usStates } from '@/features/nurse/data';
import { Button } from '@/features/shared/components/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { KeyboardAwareScrollViewComponent } from '@/features/shared/components/key-board-aware-scroll-view';
import { Stack } from '@/features/shared/components/v-stack';
import { calculateAge } from '@/features/shared/utils';
import { useEffect } from 'react';
import {
  createAssignmentValidator,
  type CreateAssignmentValidator,
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
  initialValues?: CreateAssignmentValidator;
  btnTitle?: string;
  disabled?: boolean;
};
export const CreateAssignmentForm = ({
  onSubmit,
  initialValues,
  btnTitle = 'Create',
  disabled = false,
}: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
    watch,
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
      zipcode: '',
      ...initialValues,
    },
    resolver: zodResolver(createAssignmentValidator),
  });

  const dob = watch('dateOfBirth');
  const age = calculateAge(dob);
  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);
  const gender = watch('gender');
  const selectedOther = gender === 'others';

  return (
    <KeyboardAwareScrollViewComponent>
      <Stack gap={'xl'}>
        <ControlInput
          control={control}
          errors={errors}
          name="firstName"
          label="Patient's first name"
          placeholder="John"
        />
        <ControlInput
          control={control}
          errors={errors}
          name="lastName"
          label="Patient's last name"
          placeholder="Doe"
        />

        <ControlInput
          control={control}
          errors={errors}
          name="phoneNumber"
          keyboardType="phone-pad"
          label="Phone number"
          placeholder="Enter your phone number"
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
            { label: 'Other', value: 'others' },
          ]}
        />
        {selectedOther && (
          <ControlInput
            control={control}
            errors={errors}
            name="customGender"
            label="Please specify the gender"
            placeholder="Gender"
          />
        )}

        <ControlledDatePicker
          control={control}
          errors={errors}
          name="dateOfBirth"
          label="Date of birth"
          age={age}
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
          disabled={disabled}
        />
        <ControlledDatePicker
          control={control}
          errors={errors}
          name="endDate"
          label="End date"
          disabled={disabled}
        />
        <ControlledDatePicker
          control={control}
          errors={errors}
          name="openShift"
          label="Open shift"
          mode="time"
          disabled={disabled}
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
          name="zipcode"
          label="Zip code"
          placeholder="Enter zip code"
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
          title={btnTitle}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
      </Stack>
    </KeyboardAwareScrollViewComponent>
  );
};
