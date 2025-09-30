import { api } from '@/convex/_generated/api';
import { LoadingComponent } from '@/features/shared/components/loading';

import { Stack } from '@/features/shared/components/v-stack';
import { usePaginatedQuery } from 'convex/react';
import { AssignmentsForNurses } from './assignments';

export const AvailableAssignments = () => {
  const { loadMore, results, status } = usePaginatedQuery(
    api.assignments.availableAssignments,
    { status: 'not_covered' },
    { initialNumItems: 25 }
  );
  if (status === 'LoadingFirstPage') {
    return <LoadingComponent />;
  }

  const handleFetchMore = () => {
    if (status === 'CanLoadMore') {
      loadMore(25);
    }
  };
  const isLoadingMore = status === 'LoadingMore';
  // const isExhausted = status === 'Exhausted';

  return (
    <Stack flex={1}>
      <AssignmentsForNurses
        data={results}
        handleMore={handleFetchMore}
        isLoadingMore={isLoadingMore}
      />
    </Stack>
  );
};
