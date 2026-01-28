import { useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useFocusEffect } from 'expo-router';
import { type Id } from '@/convex/_generated/dataModel';

type Props = {
  nurseId: Id<'nurses'>;
  assignmentId: Id<'assignments'>;
};

export const useUpdateToNotCompleted = ({ nurseId, assignmentId }: Props) => {
  const updateToNotCompleted = useMutation(
    api.posts.updateAssignmentToNotCompleted,
  );
  useFocusEffect(
    useCallback(() => {
      const onHandle = async () => {
        await updateToNotCompleted({ nurseId, assignmentId });
      };
      void onHandle();
    }, [updateToNotCompleted, nurseId, assignmentId]),
  );
};
