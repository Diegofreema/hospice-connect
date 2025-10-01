import { useHospice } from '@/components/context/hospice-context';
import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CreateAssignmentForm } from '@/features/hospice/components/create-assignment-form';
import { CreateAssignmentValidator } from '@/features/hospice/validator';
import { Wrapper } from '@/features/shared/components/wrapper';
import { generateErrorMessage } from '@/features/shared/utils';

import { useMutation } from 'convex/react';
import { differenceInHours, format } from 'date-fns';
import { router } from 'expo-router';
import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const CreateScreen = () => {
  const { showToast } = useToast();
  const { hospice } = useHospice();
  const createAssignment = useMutation(api.assignments.createAssignment);
  const onSubmit = async (data: CreateAssignmentValidator) => {
    if (!hospice) return;
    const numberOfShifts = Math.round(
      differenceInHours(data.endDate, data.startDate) / 12
    );
    const array: {
      start: string;
      end: string;
      startShift: string;
      endShift: string;
    }[] = [];
    for (let index = 0; index < numberOfShifts; index++) {
      const shiftStart = new Date(data.startDate);
      shiftStart.setHours(shiftStart.getHours() + index * 12);

      const shiftEnd = new Date(shiftStart);
      shiftEnd.setHours(shiftEnd.getHours() + 12);

      // Format times as strings (e.g., "7:00 AM")
      const startShift = shiftStart.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const endShift = shiftEnd.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      array.push({
        start: format(shiftStart, 'dd-MM-yyyy'),
        end: format(shiftEnd, 'dd-MM-yyyy'),
        startShift,
        endShift,
      });
    }

    try {
      await createAssignment({
        ...data,
        openShift: format(new Date(data.openShift), 'h:mm a'),
        startDate: format(new Date(data.startDate), 'dd-MM-yyyy'),
        endDate: format(new Date(data.endDate), 'dd-MM-yyyy'),
        dateOfBirth: format(new Date(data.dateOfBirth), 'dd-MM-yyyy'),
        hospiceId: hospice._id as Id<'hospices'>,
        rate: Number(data.rate),
        shifts: array,
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
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <CreateAssignmentForm onSubmit={onSubmit} />
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

export default CreateScreen;
