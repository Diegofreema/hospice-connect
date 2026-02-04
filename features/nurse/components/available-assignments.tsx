import { api } from '@/convex/_generated/api';

import { type Id } from '@/convex/_generated/dataModel';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { UnderReview } from '@/features/shared/components/under-review';
import { Stack } from '@/features/shared/components/v-stack';
import { sortedArray } from '@/features/shared/utils';
import { usePaginatedQuery } from 'convex/react';
import { AssignmentsForNurses } from './assignments';

type Props = {
  nurseId: Id<'nurses'>;
  discipline: 'RN' | 'LVN' | 'HHA';
  onOpenSheet: () => void;
  isSuspended: boolean;
};
export const AvailableAssignments = ({
  nurseId,
  onOpenSheet,
  discipline,
  isSuspended,
}: Props) => {
  const { loadMore, results, status } = usePaginatedQuery(
    api.assignments.availableAssignments,
    { nurseId, discipline: discipline },
    { initialNumItems: 50 },
  );

  if (isSuspended) {
    return (
      <UnderReview
        title="Account suspended"
        description="Please submit your outstanding Route Sheet(s) to reactivate your account"
      />
    );
  }
  if (status === 'LoadingFirstPage') {
    return <SmallLoader size={50} />;
  }

  const handleFetchMore = () => {
    if (status === 'CanLoadMore') {
      loadMore(25);
    }
  };
  const isLoadingMore = status === 'LoadingMore';
  // const isExhausted = status === 'Exhausted';
  const sortedResults = sortedArray(results);
  return (
    <Stack flex={1}>
      <AssignmentsForNurses
        data={sortedResults}
        handleMore={handleFetchMore}
        isLoadingMore={isLoadingMore}
        onOpenSheet={onOpenSheet}
      />
    </Stack>
  );
};
