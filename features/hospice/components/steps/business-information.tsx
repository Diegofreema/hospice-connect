import React from 'react';
import { useForm } from 'react-hook-form';

import { api } from '@/convex/_generated/api';
import { ControlInput } from '@/features/authentication/components/form/control-input';
import { ControlSelect } from '@/features/authentication/components/form/control-select';
import { usStates } from '@/features/nurse/data';
import { Button } from '@/features/shared/components/button';
import { Stack } from '@/features/shared/components/v-stack';

import { generateErrorMessage } from '@/features/shared/utils';

import { useToast } from '@/components/demos/toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import {
  createHospiceValidator,
  CreateHospiceValidator,
} from '../../validator';

export const BusinessInformation = () => {
  const { showToast } = useToast();
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<CreateHospiceValidator>({
    defaultValues: {},
    resolver: zodResolver(createHospiceValidator),
  });
  const createHospice = useMutation(api.hospices.createHospice);
  const onSubmit = async (data: CreateHospiceValidator) => {
    try {
      await createHospice({
        businessName: data.businessName.trim(),
        address: data.address.trim(),
        licenseNumber: data.licenseNumber.trim(),
        phoneNumber: data.phoneNumber.trim(),
        state: data.state.trim(),
      });
      showToast({
        title: 'Success',
        subtitle: 'Nurse account created successfully',
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to create nurse'
      );

      showToast({
        title: 'Error',
        subtitle: errorMessage,
      });
    }
  };
  return (
    <Stack gap="md">
      <ControlInput
        control={control}
        errors={errors}
        name="businessName"
        label="Business Name"
        placeholder="Business Name"
      />

      <ControlInput
        control={control}
        errors={errors}
        name="phoneNumber"
        label="Business Phone Number"
        placeholder="Add your business phone number"
        keyboardType="number-pad"
      />

      <ControlInput
        control={control}
        errors={errors}
        name="licenseNumber"
        label="License Number"
        placeholder="Add your license number"
      />
      <ControlInput
        control={control}
        errors={errors}
        name="address"
        label="Business Address"
        placeholder="Add your business address"
        variant="textarea"
      />
      <ControlSelect
        control={control}
        errors={errors}
        name="state"
        placeholder="Select a state"
        label="State of registration"
        items={usStates}
      />

      <Button
        onPress={handleSubmit(onSubmit)}
        title="Create"
        disabled={isSubmitting}
      />
    </Stack>
  );
};
