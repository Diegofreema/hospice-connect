import { api } from '@/convex/_generated/api';
import { LoadingComponent } from '@/features/shared/components/loading';
import View from '@/features/shared/components/view';
import { usePaginatedQuery } from 'convex/react';
import React from 'react';
import { AssignmentsForNurses } from './assignments';

export const CompletedAssignments = () => {
  const { loadMore, results, status } = usePaginatedQuery(
    api.assignments.completedAssignments,
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
  return (
    <View flex={1}>
      <AssignmentsForNurses
        data={results}
        handleMore={handleFetchMore}
        isLoadingMore={isLoadingMore}
        title={'No completed assignments yet'}
        description={'Please check in later.'}
      />
    </View>
  );
};
