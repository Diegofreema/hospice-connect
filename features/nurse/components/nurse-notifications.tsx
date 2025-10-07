import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { SmallLoader } from '@/features/shared/components/small-loader';
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
      data={results}
      renderItem={({ item }) => <NurseNotification notification={item} />}
      onEndReached={onLoadMore}
      recycleItems
      columnWrapperStyle={{ gap: 20 }}
      keyExtractor={(item) => item._id}
    />
  );
};
