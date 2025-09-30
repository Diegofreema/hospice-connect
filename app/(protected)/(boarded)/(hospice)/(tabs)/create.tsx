import { useHospice } from '@/components/context/hospice-context';
import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CreateAssignmentForm } from '@/features/hospice/components/create-assignment-form';
import { CreateAssignmentValidator } from '@/features/hospice/validator';
import { Wrapper } from '@/features/shared/components/wrapper';
import { generateErrorMessage } from '@/features/shared/utils';

import { useMutation } from 'convex/react';
import { format } from 'date-fns';
import { router } from 'expo-router';
import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const CreateScreen = () => {
  const { showToast } = useToast();
  const { hospice } = useHospice();
  const createAssignment = useMutation(api.assignments.createAssignment);
  const onSubmit = async (data: CreateAssignmentValidator) => {
    if (!hospice) return;
    try {
      await createAssignment({
        ...data,
        openShift: format(new Date(data.openShift), 'h:mm a'),
        startDate: format(new Date(data.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(data.endDate), 'yyyy-MM-dd'),
        dateOfBirth: format(new Date(data.dateOfBirth), 'yyyy-MM-dd'),
        hospiceId: hospice._id as Id<'hospices'>,
        rate: Number(data.rate),
      });
      showToast({
        title: 'Success',
        subtitle: 'Assignment created successfully',
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
