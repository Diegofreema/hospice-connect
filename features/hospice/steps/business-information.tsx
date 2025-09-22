import React from 'react';
import { useForm } from 'react-hook-form';

import { api } from '@/convex/_generated/api';
import { ControlInput } from '@/features/authentication/components/form/control-input';
import { ControlSelect } from '@/features/authentication/components/form/control-select';
import { usStates } from '@/features/nurse/data';
import { Button } from '@/features/shared/components/button';
import View from '@/features/shared/components/view';
import { generateErrorMessage } from '@/features/shared/utils';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { createHospiceValidator, CreateHospiceValidator } from '../validator';

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
      await createHospice(data);
      showToast({
        title: 'Success',
        description: 'Nurse account created successfully',
        type: 'success',
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to create nurse'
      );

      showToast({
        title: 'Error',
        description: errorMessage,
        type: 'error',
      });
    }
  };
  return (
    <View g={'m'}>
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
      <View flex={1}>
        <Button
          onPress={handleSubmit(onSubmit)}
          label="Create"
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );
};
