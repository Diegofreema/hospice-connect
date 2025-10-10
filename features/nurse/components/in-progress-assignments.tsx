import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

import { SmallLoader } from '@/features/shared/components/small-loader';
import { Stack } from '@/features/shared/components/v-stack';
import { usePaginatedQuery } from 'convex/react';
import { InProgress } from './in-progress';
type Props = {
  nurseId: Id<'nurses'>;
  onOpenSheet: () => void;
};
export const InProgressAssignments = ({ nurseId, onOpenSheet }: Props) => {
  const { loadMore, results, status } = usePaginatedQuery(
    api.shifts.getInProgressShifts,
    { nurseId },
    { initialNumItems: 25 }
  );
  if (status === 'LoadingFirstPage') {
    return <SmallLoader size={50} />;
  }

  const handleFetchMore = () => {
    if (status === 'CanLoadMore') {
      loadMore(25);
    }
  };
  const isLoadingMore = status === 'LoadingMore';
  return (
    <Stack flex={1}>
      <InProgress
        // @ts-ignore
        data={results}
        handleMore={handleFetchMore}
        isLoadingMore={isLoadingMore}
        onOpenSheet={onOpenSheet}
      />
    </Stack>
  );
};
