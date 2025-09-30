import React from 'react';

import { Subtitle } from '@/components/subtitle/Subtitle';
import { ControlInput } from '@/features/authentication/components/form/control-input';
import { ControlSelect } from '@/features/authentication/components/form/control-select';
import { MyTitle } from '@/features/shared/components/my-title';
import { Spacer } from '@/features/shared/components/spacer';

import { Stack } from '@/features/shared/components/v-stack';
import { disciplines, usStates } from '../../data';
import { StepProps } from '../../validators';

export const License = ({ form }: StepProps) => {
  return (
    <Stack>
      <Spacer />
      <MyTitle title="License" />
      <Subtitle style={{ color: 'black' }}>
        Please ensure the accuracy of all Information
      </Subtitle>
      <Spacer height={50} />
      <Stack gap="md" mb="xl">
        <ControlSelect
          control={form.control}
          errors={form.formState.errors}
          name="discipline"
          placeholder="Select discipline"
          label="Discipline"
          items={disciplines}
        />
        <ControlSelect
          control={form.control}
          errors={form.formState.errors}
          name="licenseState"
          placeholder="Select a state"
          label="State of registration"
          items={usStates}
        />
        <ControlInput
          control={form.control}
          errors={form.formState.errors}
          name="licenseNumber"
          placeholder="Enter your license number"
          label="License Number"
        />
      </Stack>
    </Stack>
  );
};
