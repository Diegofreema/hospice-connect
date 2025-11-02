import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

type Props = {
  assignmentId: Id<'assignments'>;
};

export const useUpdatePostStatus = ({ assignmentId }: Props) => {
  const updateStatus = useMutation(api.assignments.updateAssignmentStatus);

  useFocusEffect(
    useCallback(() => {
      if (assignmentId) {
        const onUpdateStatus = async () => {
          try {
            await updateStatus({
              assignmentId,
            });
          } catch (error) {
            console.log(error);
          }
        };
       void onUpdateStatus();
      }
    }, [updateStatus, assignmentId])
  );
};
