import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { useScrollToTop } from '@/features/shared/hooks/use-scroll-to-top';
import { LegendList } from '@legendapp/list';
import { useMutation, usePaginatedQuery } from 'convex/react';
import { useEffect } from 'react';
import { View } from 'react-native';
import { HospiceNotification } from './hospsice-notification';

type Props = {
  hospiceId: Id<'hospices'>;
};
export const Notifications = ({ hospiceId }: Props) => {
  const { loadMore, results, status } = usePaginatedQuery(
    api.hospiceNotification.getNotifications,
    { hospiceId },
    { initialNumItems: 25 },
  );
  const markNotificationAsRead = useMutation(
    api.hospiceNotification.markNotificationAsRead,
  );
  useEffect(() => {
    const onMarkNotificationAsRead = async () => {
      if (results.length === 0) return;
      try {
        await markNotificationAsRead({
          hospiceId,
        });
      } catch (error) {
        console.log(error);
      }
    };
    void onMarkNotificationAsRead();
  }, [markNotificationAsRead, hospiceId, results.length]);
  const ref = useScrollToTop();
  if (status === 'LoadingFirstPage') {
    return <SmallLoader size={50} />;
  }

  const onLoadMore = () => {
    if (status === 'CanLoadMore') {
      loadMore(25);
    }
  };
  const unreadNotifications = results.filter((item) => !item.isRead);
  const readNotifications = results.filter((item) => item.isRead);
  const ListHeaderComponent = () => {
    if (unreadNotifications.length === 0) {
      return null;
    }
    return (
      <LegendList
        data={unreadNotifications}
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
          readNotifications.length > 0 ? (
            <View
              style={{
                width: '100%',
                height: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
              }}
            />
          ) : null
        }
      />
    );
  };
  return (
    <LegendList
      data={readNotifications}
      scrollEventThrottle={16}
      ListHeaderComponent={ListHeaderComponent}
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
