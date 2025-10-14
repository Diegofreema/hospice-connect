import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { useEffect } from 'react';

type Props = {
  assignmentId: Id<'assignments'>;
};

export const useUpdatePostStatus = ({ assignmentId }: Props) => {
  const updateStatus = useMutation(api.assignments.updateAssignmentStatus);

  useEffect(() => {
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
      onUpdateStatus();
    }
  }, [updateStatus, assignmentId]);
};
