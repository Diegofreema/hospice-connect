import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { useScrollToTop } from '@/features/shared/hooks/use-scroll-to-top';
import { LegendList } from '@legendapp/list';
import { useMutation, usePaginatedQuery } from 'convex/react';
import React, { useEffect } from 'react';
import { View } from 'react-native';
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
  const markNotificationAsRead = useMutation(
    api.nurseNotifications.markNotificationAsRead
  );
  useEffect(() => {
    const onMarkNotificationAsRead = async () => {
      if (results.length === 0) return;
      try {
        await markNotificationAsRead({
          nurseId,
        });
      } catch (error) {
        console.log(error);
      }
    };
    void onMarkNotificationAsRead();
  }, [markNotificationAsRead, nurseId, results.length]);
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
        renderItem={({ item }) => <NurseNotification notification={item} />}
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
      initialScrollIndex={0}
      scrollEventThrottle={16}
      ListHeaderComponent={ListHeaderComponent}
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
