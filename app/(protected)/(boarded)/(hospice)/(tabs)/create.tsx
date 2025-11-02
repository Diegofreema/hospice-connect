import { useHospice } from '@/components/context/hospice-context';
import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CreateAssignmentForm } from '@/features/hospice/components/create-assignment-form';
import { CreateAssignmentValidator } from '@/features/hospice/validator';
import { Wrapper } from '@/features/shared/components/wrapper';
import {
  generateErrorMessage,
  generateShiftsWithDateFns,
} from '@/features/shared/utils';

import { useMutation } from 'convex/react';
import { format } from 'date-fns';
import { router } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const CreateScreen = () => {
  const { showToast } = useToast();
  const { hospice } = useHospice();
  const createAssignment = useMutation(api.assignments.createAssignment);
  const onSubmit = async (data: CreateAssignmentValidator) => {
    if (!hospice) return;



    const { customGender, ...rest } = data;

    try {
      const shifts = generateShiftsWithDateFns({
        endDate: data.endDate,
        startDate: data.startDate,
        openShift: data.openShift,
      });
      await createAssignment({
        ...rest,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        gender: data.gender === 'others' ? customGender || '' : data.gender,
        openShift: format(new Date(data.openShift), 'h:mm a'),
        startDate: format(new Date(data.startDate), 'dd-MM-yyyy'),
        endDate: format(new Date(data.endDate), 'dd-MM-yyyy'),
        dateOfBirth: format(new Date(data.dateOfBirth), 'dd-MM-yyyy'),
        hospiceId: hospice._id as Id<'hospices'>,
        rate: Number(data.rate),
        shifts,
      });
      showToast({
        title: 'Success',
        subtitle: 'Assignment created successfully',
        autodismiss: true,
      });
      router.push('/posts');
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to create assignment'
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
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        bottomOffset={50}
        bounces={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === 'ios' ? 100 : 50,
        }}
      >
        <CreateAssignmentForm onSubmit={onSubmit} />
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

export default CreateScreen;
