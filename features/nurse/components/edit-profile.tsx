import { useNurse } from '@/components/context/nurse-context';
import React from 'react';
import { useForm } from 'react-hook-form';

import { ControlInput } from '@/features/authentication/components/form/control-input';
import { Button } from '@/features/shared/components/button';

import { api } from '@/convex/_generated/api';
import { ControlSelect } from '@/features/authentication/components/form/control-select';
import { generateErrorMessage } from '@/features/shared/utils';

import { useToast } from '@/components/demos/toast';
import { KeyboardAwareScrollViewComponent } from '@/features/shared/components/key-board-aware-scroll-view';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { disciplines, usStates } from '../data';
import { createNurseValidator, CreateNurseValidator } from '../validators';

export const EditProfile = () => {
  const { nurse } = useNurse();
  const { showToast } = useToast();
  const updateNurse = useMutation(api.nurses.editNurse);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<CreateNurseValidator>({
    defaultValues: {
      firstName: nurse?.firstName || '',
      lastName: nurse?.lastName || '',
      phoneNumber: nurse?.phoneNumber || '',
      gender: nurse?.gender || '',
      dateOfBirth: new Date(),
      discipline: nurse?.discipline,
      licenseNumber: nurse?.licenseNumber || '',
      licenseState: nurse?.stateOfRegistration || '',
      address: nurse?.address || '',
      rate: nurse?.rate?.toString() || '0',
      email: nurse?.email,
      zipCode: nurse?.zipCode || '',
    },
    resolver: zodResolver(createNurseValidator),
  });

  const onSubmit = async (data: CreateNurseValidator) => {
    if (!nurse) return;
    try {
      await updateNurse({
        nurseId: nurse?._id,
        address: data.address?.trim(),
        rate: Number(data.rate),
        stateOfRegistration: data.licenseState,
        discipline: data.discipline,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phoneNumber: data.phoneNumber.trim(),
        licenseNumber: data.licenseNumber.trim(),
      });
      showToast({
        title: 'Success',
        subtitle: 'Pending admin approval',
        autodismiss: true,
      });
      router.back();
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to update information'
      );

      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    }
  };

  return (
    <KeyboardAwareScrollViewComponent>
      <View style={{ marginTop: 10, gap: 20 }}>
        <ControlInput
          control={control}
          name={'firstName'}
          errors={errors}
          label="First name"
          placeholder="John"
        />
        <ControlInput
          control={control}
          name={'lastName'}
          errors={errors}
          label="Last name"
          placeholder="Doe"
        />
        <ControlInput
          control={control}
          name={'email'}
          errors={errors}
          label="Email"
          placeholder="Doe"
        />
        <ControlInput
          control={control}
          name={'phoneNumber'}
          errors={errors}
          label="Phone number"
          placeholder="+1 (123) 456-7890"
          keyboardType="number-pad"
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
        />

        <ControlSelect
          control={control}
          errors={errors}
          name="licenseState"
          placeholder="Select a state"
          label="State of registration"
          items={usStates}
        />
        <ControlSelect
          control={control}
          errors={errors}
          name="discipline"
          placeholder="Select a your discipline"
          label="Discipline"
          items={disciplines}
        />
        <ControlInput
          control={control}
          name={'address'}
          errors={errors}
          label="Address"
          placeholder="John doe street, 123"
          variant="textarea"
        />

        <View style={{ marginTop: 'auto' }}>
          <Button
            title="Save changes"
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            style={{ marginBottom: 50 }}
          />
        </View>
      </View>
    </KeyboardAwareScrollViewComponent>
  );
};
