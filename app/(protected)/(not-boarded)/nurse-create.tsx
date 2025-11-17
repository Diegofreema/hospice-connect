import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { License } from '@/features/nurse/components/step/license';
import { PersonalInfo } from '@/features/nurse/components/step/personal-info';
import {
  createNurseValidator,
  CreateNurseValidator,
} from '@/features/nurse/validators';

import { BackButton } from '@/features/shared/components/back-button';
import { Button } from '@/features/shared/components/button';
import { Text } from '@/features/shared/components/text';
import { Stack } from '@/features/shared/components/v-stack';

import { Wrapper } from '@/features/shared/components/wrapper';
import { generateErrorMessage, validateFields } from '@/features/shared/utils';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const STEPS = [
  { id: 1, title: 'Personal info', component: PersonalInfo },
  { id: 2, title: 'License', component: License },
];
const NurseCreate = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { showToast } = useToast();
  const createNurse = useMutation(api.nurses.createNurse);
  const form = useForm<CreateNurseValidator>({
    defaultValues: {
      dateOfBirth: new Date(1598051730000),
      discipline: 'RN',
      firstName: '',
      gender: '',
      lastName: '',
      licenseNumber: '',
      licenseState: '',
      phoneNumber: '',
      address: '',
      rate: '',
      zipCode: '',
    },
    resolver: zodResolver(createNurseValidator),
  });

  const getFieldsForStep = (step: number): (keyof CreateNurseValidator)[] => {
    switch (step) {
      case 1:
        return [
          'phoneNumber',
          'firstName',
          'lastName',
          'gender',
          'dateOfBirth',
          'rate',
          'address',
          'zipCode',
        ];
      case 2:
        return ['discipline', 'licenseNumber', 'licenseState'];

      default:
        return [];
    }
  };
  const fieldsToValidate = getFieldsForStep(currentStep);

  const values = form.watch();

  const stepIsValid = validateFields(fieldsToValidate, values);

  const nextStep = async () => {
    if (stepIsValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: CreateNurseValidator) => {
    const { licenseState, ...rest } = data;

    try {
      await createNurse({
        ...rest,
        dateOfBirth: format(data?.dateOfBirth || new Date(), 'PPP'),
        stateOfRegistration: licenseState,
        licenseNumber: data.licenseNumber.trim(),
        phoneNumber: data.phoneNumber.trim(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
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
  const CurrentStepComponent = STEPS[currentStep - 1].component;
  return (
    <Wrapper>
      <BackButton />
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ alignSelf: 'flex-end' }}>
          Step {currentStep} of {STEPS.length}
        </Text>
        <CurrentStepComponent form={form} />
        <Stack mode={'flex'} gap={'md'}>
          {currentStep > 1 && (
            <View style={{ flex: 1 }}>
              <Button title="Previous" onPress={prevStep} />
            </View>
          )}
          {currentStep < STEPS.length ? (
            <View style={{ flex: 1 }}>
              <Button title="Next" onPress={nextStep} disabled={!stepIsValid} />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Button
                title="Submit"
                onPress={form.handleSubmit(onSubmit)}
                disabled={!stepIsValid || form.formState.isSubmitting}
              />
            </View>
          )}
        </Stack>
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

export default NurseCreate;
