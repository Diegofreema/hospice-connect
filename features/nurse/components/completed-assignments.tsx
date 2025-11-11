import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { LoadingComponent } from "@/features/shared/components/loading";

import { Stack } from "@/features/shared/components/v-stack";
import { usePaginatedQuery } from "convex/react";
import React from "react";
import { CompletedAssignmentsList } from "./completed-assignments-list";
import { sortedArray } from "@/features/shared/utils";
type Props = {
  nurseId: Id<"nurses">;
};
export const CompletedAssignments = ({ nurseId }: Props) => {
  const { loadMore, results, status } = usePaginatedQuery(
    api.assignments.completedAssignments,
    { nurseId },
    { initialNumItems: 25 },
  );
  if (status === "LoadingFirstPage") {
    return <LoadingComponent />;
  }

  const handleFetchMore = () => {
    if (status === "CanLoadMore") {
      loadMore(25);
    }
  };
  const isLoadingMore = status === "LoadingMore";
  const sortedResults = sortedArray(results);
  return (
    <Stack flex={1}>
      <CompletedAssignmentsList
        handleMore={handleFetchMore}
        isLoadingMore={isLoadingMore}
        data={sortedResults}
      />
    </Stack>
  );
};
