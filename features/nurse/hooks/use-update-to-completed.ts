import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useFocusEffect } from "expo-router";
import { Id } from "@/convex/_generated/dataModel";

type Props = {
  nurseId: Id<"nurses">;
  assignmentId: Id<"assignments">;
};

export const useUpdateToCompleted = ({ nurseId, assignmentId }: Props) => {
  const updateToCompleted = useMutation(api.posts.updateAssignmentToCompleted);
  useFocusEffect(
    useCallback(() => {
      const onHandle = async () => {
        await updateToCompleted({ nurseId, assignmentId });

      };
      void onHandle();
    }, [updateToCompleted, nurseId, assignmentId]),
  );
};
