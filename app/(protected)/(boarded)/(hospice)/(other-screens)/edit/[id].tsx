import { useHospice } from '@/components/context/hospice-context';

import { useToast } from '../../../../../../components/demos/toast';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CreateAssignmentForm } from '@/features/hospice/components/create-assignment-form';
import { CreateAssignmentValidator } from '@/features/hospice/validator';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import { generateErrorMessage } from '@/features/shared/utils';

import { IconCheck, IconX } from '@tabler/icons-react-native';
import { useMutation, useQuery } from 'convex/react';
import { format } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useUnistyles } from 'react-native-unistyles';

const EditScreen = () => {
  const { id } = useLocalSearchParams<{ id: Id<'assignments'> }>();
  const { hospice } = useHospice();
  const { theme } = useUnistyles();
  const assignment = useQuery(api.assignments.getAssignment, {
    assignmentId: id!,
  });
  const { showToast } = useToast();
  const updateAssignment = useMutation(api.assignments.updateAssignment);
  const onSubmit = async (data: CreateAssignmentValidator) => {
    if (!hospice) return;
    try {
      await updateAssignment({
        assignmentId: id,
        ...data,
        openShift: format(new Date(data.openShift), 'h:mm a'),
        startDate: format(new Date(data.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(data.endDate), 'yyyy-MM-dd'),
        dateOfBirth: format(new Date(data.dateOfBirth), 'yyyy-MM-dd'),
        rate: Number(data.rate),
        hospiceId: hospice?._id as Id<'hospices'>,
      });
      showToast({
        title: 'Success',
        subtitle: 'Assignment updated successfully',
        autodismiss: true,
        leading: () => <IconCheck size={20} color={theme.colors.greenDark} />,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to update assignment'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
        leading: () => <IconX size={20} color={theme.colors.redDark} />,
      });
    }
  };
  if (assignment === undefined) {
    return null;
  }

  if (assignment === null) {
    return null;
  }

  const formattedAssignment = {
    ...assignment,
    openShift: new Date(assignment.openShift),
    startDate: new Date(assignment.startDate),
    endDate: new Date(assignment.endDate),
    dateOfBirth: new Date(assignment.dateOfBirth),
    rate: String(assignment.rate),
    firstName: assignment.patientFirstName,
    lastName: assignment.patientLastName,
    additionalNotes: assignment.notes,
    address: assignment.patientAddress,
  };

  return (
    <Wrapper>
      <BackButton title="Edit Assignment" />
      <CreateAssignmentForm
        onSubmit={onSubmit}
        initialValues={formattedAssignment}
        btnTitle="Update"
      />
    </Wrapper>
  );
};

export default EditScreen;
