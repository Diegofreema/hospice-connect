import { Subtitle } from '@/components/subtitle/Subtitle';
import { ControlledDatePicker } from '@/features/authentication/components/form/control-date-picker';
import { ControlInput } from '@/features/authentication/components/form/control-input';
import { ControlSelect } from '@/features/authentication/components/form/control-select';
import { MyTitle } from '@/features/shared/components/my-title';
import { Spacer } from '@/features/shared/components/spacer';

import { Stack } from '@/features/shared/components/v-stack';
import { calculateAge } from '@/features/shared/utils';
import React from 'react';
import { type StepProps } from '../../validators';

export const PersonalInfo = ({ form }: StepProps) => {
  const {
    control,
    formState: { errors },
    watch,
  } = form;
  const dob = watch('dateOfBirth');

  const age = calculateAge(dob as Date);
  console.log({ age });

  return (
    <Stack mb="xl">
      <Spacer />
      <MyTitle title="Personal Information" />
      <Subtitle style={{ color: 'black' }}>
        Please ensure the accuracy of all Information
      </Subtitle>
      <Spacer height={50} />
      <Stack gap="md">
        <ControlInput
          control={control}
          errors={errors}
          name="phoneNumber"
          placeholder="Enter your phone number"
          label="Phone number"
          keyboardType="phone-pad"
        />

        <ControlSelect
          control={control}
          name="gender"
          items={[
            { label: 'Others', value: 'other' },
            { label: 'Female', value: 'female' },
            { label: 'Male', value: 'male' },
          ]}
          errors={errors}
          label="Gender"
          placeholder="Select gender"
        />
        <ControlledDatePicker
          control={control}
          errors={errors}
          name="dateOfBirth"
          label="Date of Birth"
          placeholder="Enter date of birth"
          age={age}
        />
        <ControlInput
          control={control}
          name={'rate'}
          errors={errors}
          label="Rate/hr"
          placeholder="10"
          keyboardType="numeric"
        />
        <ControlInput
          control={control}
          name={'zipCode'}
          errors={errors}
          label="Zip Code"
          placeholder="Enter zip code"
          keyboardType="numeric"
        />
        <ControlInput
          control={control}
          name={'address'}
          errors={errors}
          label="Address"
          placeholder="John doe street, 123"
          variant="textarea"
        />
      </Stack>
    </Stack>
  );
};
