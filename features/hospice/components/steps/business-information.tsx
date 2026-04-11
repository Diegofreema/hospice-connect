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
import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { Alert } from 'react-native';
import {
  createHospiceValidator,
  type CreateHospiceValidator,
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
        zipcode: data.zipcode.trim(),
      });
      authClient.updateUser({
        isBoarded: true,
        role: 'hospice',
        name: data.businessName.trim(),
      });
      showToast({
        title: 'Success',
        subtitle: 'Hospice account created successfully',
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to create hospice account',
      );

      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    }
  };

  const onConfirmBeforeSubmit = async () => {
    Alert.alert(
      'Confirm Submission',
      'Are you sure you want to create this Hospice business account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => handleSubmit(onSubmit) },
      ],
    );
  };
  return (
    <Stack gap="xl">
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
        name="zipcode"
        label="Zip Code"
        placeholder="Add your zip code"
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
        onPress={onConfirmBeforeSubmit}
        title="Create"
        disabled={isSubmitting}
      />
    </Stack>
  );
};
