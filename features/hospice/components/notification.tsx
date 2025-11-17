import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { useScrollToTop } from '@/features/shared/hooks/use-scroll-to-top';
import { LegendList } from '@legendapp/list';
import { usePaginatedQuery } from 'convex/react';
import { HospiceNotification } from './hospsice-notification';
type Props = {
  hospiceId: Id<'hospices'>;
};
export const Notifications = ({ hospiceId }: Props) => {
  const { loadMore, results, status } = usePaginatedQuery(
    api.hospiceNotification.getNotifications,
    { hospiceId },
    { initialNumItems: 25 }
  );
  const ref = useScrollToTop({ results });
  if (status === 'LoadingFirstPage') {
    return <SmallLoader size={50} />;
  }

  const onLoadMore = () => {
    if (status === 'CanLoadMore') {
      loadMore(25);
    }
  };
  const sortedNotifications = [...results].sort(
    (a, b) => b._creationTime - a._creationTime
  );

  return (
    <LegendList
      data={sortedNotifications}
      scrollEventThrottle={16}
      ref={ref}
      renderItem={({ item }) => <HospiceNotification notification={item} />}
      onEndReached={onLoadMore}
      keyExtractor={(item) => item._id}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      recycleItems
      contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
      ListFooterComponent={
        status === 'LoadingMore' ? <SmallLoader size={15} /> : null
      }
    />
  );
};
