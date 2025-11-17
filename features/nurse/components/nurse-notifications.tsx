import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { useScrollToTop } from '@/features/shared/hooks/use-scroll-to-top';
import { LegendList } from '@legendapp/list';
import { usePaginatedQuery } from 'convex/react';
import React from 'react';
import { NurseNotification } from './nurse-notification';

type Props = {
  nurseId: Id<'nurses'>;
};

export const FetchNurseNotification = ({ nurseId }: Props) => {
  const { results, loadMore, status } = usePaginatedQuery(
    api.nurseNotifications.getNurseNotifications,
    {
      nurseId,
    },
    { initialNumItems: 25 }
  );
  const ref = useScrollToTop();
  if (status === 'LoadingFirstPage') {
    return <SmallLoader size={50} />;
  }
  const onLoadMore = () => {
    if (status === 'CanLoadMore') {
      loadMore(25);
    }
  };

  return (
    <LegendList
      initialScrollIndex={0}
      scrollEventThrottle={16}
      ref={ref}
      data={results}
      renderItem={({ item }) => <NurseNotification notification={item} />}
      onEndReached={onLoadMore}
      keyExtractor={(item) => item._id}
      onEndReachedThreshold={0.5}
      recycleItems
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 20, paddingBottom: 100 }}
    />
  );
};
