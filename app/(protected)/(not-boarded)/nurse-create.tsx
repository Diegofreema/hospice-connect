import { api } from '@/convex/_generated/api';
import { License } from '@/features/nurse/components/step/license';
import { PersonalInfo } from '@/features/nurse/components/step/personal-info';
import {
  createNurseValidator,
  CreateNurseValidator,
} from '@/features/nurse/validators';

import { BackButton } from '@/features/shared/components/back-button';
import { Button } from '@/features/shared/components/button';
import Text from '@/features/shared/components/text';
import View from '@/features/shared/components/view';
import { Wrapper } from '@/features/shared/components/wrapper';
import { generateErrorMessage, validateFields } from '@/features/shared/utils';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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
    console.log(rest);

    try {
      await createNurse({
        ...rest,
        dateOfBirth: format(data?.dateOfBirth || new Date(), 'PPP'),
        stateOfRegistration: licenseState,
      });
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
  const CurrentStepComponent = STEPS[currentStep - 1].component;
  return (
    <Wrapper>
      <BackButton />
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <Text alignSelf={'flex-end'}>
          Step {currentStep} of {STEPS.length}
        </Text>
        <CurrentStepComponent form={form} />
        <View flexDirection={'row'} gap={'m'}>
          {currentStep > 1 && (
            <View flex={1}>
              <Button label="Previous" onPress={prevStep} />
            </View>
          )}
          {currentStep < STEPS.length ? (
            <View flex={1}>
              <Button label="Next" onPress={nextStep} disabled={!stepIsValid} />
            </View>
          ) : (
            <View flex={1}>
              <Button
                label="Submit"
                onPress={form.handleSubmit(onSubmit)}
                disabled={!stepIsValid}
                loading={form.formState.isSubmitting}
                loadingText="Submitting..."
              />
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

export default NurseCreate;
