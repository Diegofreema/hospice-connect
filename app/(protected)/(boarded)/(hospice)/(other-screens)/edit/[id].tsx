import { useHospice } from '@/components/context/hospice-context';

import { useToast } from '../../../../../../components/demos/toast';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CreateAssignmentForm } from '@/features/hospice/components/create-assignment-form';
import { CreateAssignmentValidator } from '@/features/hospice/validator';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import {
  convertTimeStringToDate,
  generateErrorMessage,
  generateShifts,
} from '@/features/shared/utils';

import Banner from '@/features/shared/components/banner';
import { IconCheck, IconX } from '@tabler/icons-react-native';
import { useMutation, useQuery } from 'convex/react';
import { format, parse } from 'date-fns';
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
    const { customGender, ...rest } = data;
    const openShift = format(new Date(rest.openShift), 'H:mm');
    const shifts = generateShifts({
      endDate: rest.endDate,
      startDate: rest.startDate,
      openShift,
    });
    try {
      await updateAssignment({
        assignmentId: id,
        ...rest,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        gender: data.gender === 'others' ? customGender || 'Male' : data.gender,
        openShift: format(new Date(data.openShift), 'h:mm a'),
        startDate: format(new Date(data.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(data.endDate), 'yyyy-MM-dd'),
        dateOfBirth: format(new Date(data.dateOfBirth), 'yyyy-MM-dd'),
        rate: Number(data.rate),
        hospiceId: hospice?._id as Id<'hospices'>,
        shifts,
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
  const startDate = parse(assignment.startDate, 'dd-MM-yyyy', new Date());
  const endDate = parse(assignment.endDate, 'dd-MM-yyyy', new Date());
  const dateOfBirth = parse(assignment.dateOfBirth, 'dd-MM-yyyy', new Date());

  const formattedAssignment = {
    ...assignment,
    openShift: new Date(convertTimeStringToDate(assignment.openShift)),
    startDate,
    endDate,
    dateOfBirth,
    rate: String(assignment.rate),
    firstName: assignment.patientFirstName,
    lastName: assignment.patientLastName,
    additionalNotes: assignment.notes,
    address: assignment.patientAddress,
  };

  return (
    <Wrapper>
      <BackButton title="Edit Assignment" marginTop={0} />
      {assignment.hasNurses && (
        <Banner description="Assignments with Healthcare professionals can't be edited" />
      )}
      <CreateAssignmentForm
        onSubmit={onSubmit}
        initialValues={formattedAssignment}
        btnTitle="Update"
        disabled={assignment.hasNurses}
      />
    </Wrapper>
  );
};

export default EditScreen;
