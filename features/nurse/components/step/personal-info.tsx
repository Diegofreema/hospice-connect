import { Subtitle } from '@/components/subtitle/Subtitle';
import { ControlledDatePicker } from '@/features/authentication/components/form/control-date-picker';
import { ControlInput } from '@/features/authentication/components/form/control-input';
import { ControlSelect } from '@/features/authentication/components/form/control-select';
import { MyTitle } from '@/features/shared/components/my-title';
import { Spacer } from '@/features/shared/components/spacer';

import { Stack } from '@/features/shared/components/v-stack';
import React from 'react';
import { StepProps } from '../../validators';

export const PersonalInfo = ({ form }: StepProps) => {
  const {
    control,
    formState: { errors },
  } = form;
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

        <ControlInput
          control={control}
          errors={errors}
          name="firstName"
          placeholder="John"
          label="First name"
        />

        <ControlInput
          control={control}
          errors={errors}
          name="lastName"
          placeholder="Doe"
          label="Last name"
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
        />
      </Stack>
    </Stack>
  );
};
