import { useNurse } from '@/components/context/nurse-context';
import React from 'react';
import { useForm } from 'react-hook-form';

import { ControlInput } from '@/features/authentication/components/form/control-input';
import { Button } from '@/features/shared/components/button';

import { api } from '@/convex/_generated/api';
import { ControlSelect } from '@/features/authentication/components/form/control-select';
import { generateErrorMessage } from '@/features/shared/utils';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { usStates } from '../data';
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
    },
    resolver: zodResolver(createNurseValidator),
  });

  const onSubmit = async (data: CreateNurseValidator) => {
    if (!nurse) return;
    try {
      await updateNurse({
        nurseId: nurse?._id,
        address: data.address,
        rate: Number(data.rate),
        stateOfRegistration: data.licenseState,
      });
      showToast({
        title: 'Success',
        description: 'Information updated successfully',
        type: 'success',
      });
      router.back();
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to update information'
      );

      showToast({
        title: 'Error',
        description: errorMessage,
        type: 'error',
      });
    }
  };

  console.log({ errors });

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={{ marginTop: 10, flex: 1, gap: 20 }}>
        <ControlInput
          control={control}
          name={'firstName'}
          errors={errors}
          label="First name"
          placeholder="John"
          editable={false}
        />
        <ControlInput
          control={control}
          name={'lastName'}
          errors={errors}
          label="Last name"
          placeholder="Doe"
          editable={false}
        />
        <ControlInput
          control={control}
          name={'email'}
          errors={errors}
          label="Email"
          placeholder="Doe"
          editable={false}
        />
        <ControlInput
          control={control}
          name={'phoneNumber'}
          errors={errors}
          label="Phone number"
          placeholder="+1 (123) 456-7890"
          editable={false}
        />

        <ControlInput
          control={control}
          name={'rate'}
          errors={errors}
          label="Rate/hr"
          placeholder="10"
          keyboardType="numeric"
        />

        <ControlSelect
          control={control}
          errors={errors}
          name="licenseState"
          placeholder="Select a state"
          label="State of registration"
          items={usStates}
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
            label="Save changes"
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            loading={isSubmitting}
            loadingText="Saving..."
            style={{ marginBottom: 50 }}
          />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};
