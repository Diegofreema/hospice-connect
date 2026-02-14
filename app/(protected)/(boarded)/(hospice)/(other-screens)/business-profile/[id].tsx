import { useHospice } from '@/components/context/hospice-context';
import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

import { ControlInput } from '@/features/authentication/components/form/control-input';
import { ControlSelect } from '@/features/authentication/components/form/control-select';
import { type UpdateProfileValidator } from '@/features/hospice/validator';
import { usStates } from '@/features/nurse/data';
import { BackButton } from '@/features/shared/components/back-button';
import { Button } from '@/features/shared/components/button';
import { KeyboardAwareScrollViewComponent } from '@/features/shared/components/key-board-aware-scroll-view';
import { View } from '@/features/shared/components/view';
import { Wrapper } from '@/features/shared/components/wrapper';
import { generateErrorMessage } from '@/features/shared/utils';
import { useMutation } from 'convex/react';
import { router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';

const EditBusinessProfile = () => {
  const { hospice } = useHospice();
  const { showToast } = useToast();
  const updateProfile = useMutation(api.hospices.updateHospiceProfile);
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileValidator>({
    defaultValues: {
      address: hospice?.address || '',
      businessName: hospice?.businessName || '',
      state: hospice?.state || '',
      phoneNumber: hospice?.phoneNumber || '',
      licenseNumber: hospice?.licenseNumber || '',
      email: hospice?.email || '',
      zipcode: hospice?.zipcode || '',
    },
  });

  const onSubmit = async (data: UpdateProfileValidator) => {
    try {
      await updateProfile({
        hospiceId: hospice?._id as Id<'hospices'>,
        address: data.address?.trim(),
        businessName: data.businessName?.trim(),
        email: data.email?.trim(),
        licenseNumber: data.licenseNumber?.trim(),
        phoneNumber: data.phoneNumber?.trim(),
        state: data.state?.trim(),
        zipcode: data.zipcode?.trim(),
      });
      showToast({
        title: 'Success',
        subtitle: "Awaiting admin's approval to reflect",
        autodismiss: true,
      });
      router.back();
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to update information',
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    }
  };
  return (
    <Wrapper>
      <BackButton title="Edit Profile" marginTop={0} />
      <KeyboardAwareScrollViewComponent>
        <View gap="xxl">
          <ControlInput
            control={control}
            errors={errors}
            name="businessName"
            placeholder="Enter your business Name"
            label="Business Name"
          />
          <ControlInput
            control={control}
            errors={errors}
            name="phoneNumber"
            placeholder="Enter your phone number"
            label="Phone number"
            keyboardType="number-pad"
          />
          <ControlInput
            control={control}
            errors={errors}
            name="email"
            placeholder="Enter your email"
            label="Email"
            keyboardType="email-address"
          />
          <ControlInput
            control={control}
            errors={errors}
            name="licenseNumber"
            placeholder="Enter your license number"
            label="License Number"
          />

          <ControlInput
            control={control}
            errors={errors}
            name="address"
            placeholder="Enter your business address"
            label="Address"
            variant="textarea"
          />

          <ControlInput
            control={control}
            errors={errors}
            name="zipcode"
            placeholder="Enter your zip code"
            label="Zip Code"
            keyboardType="number-pad"
          />
          <ControlSelect
            control={control}
            errors={errors}
            name="state"
            label="State of registration"
            items={usStates}
            placeholder="Select a state"
          />
          <Button
            title="Update"
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          />
        </View>
      </KeyboardAwareScrollViewComponent>
    </Wrapper>
  );
};

export default EditBusinessProfile;
