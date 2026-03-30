import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { useScrollToTop } from '@/features/shared/hooks/use-scroll-to-top';
import { LegendList, type LegendListRenderItemProps } from '@legendapp/list';
import { useMutation, usePaginatedQuery } from 'convex/react';
import React, { useCallback, useEffect } from 'react';
import { Text, View } from 'react-native';
import { HospiceNotification } from './hospsice-notification';

type Notification = ReturnType<
  typeof usePaginatedQuery<typeof api.hospiceNotification.getNotifications>
>['results'][number];

type UnreadListProps = {
  unreadNotifications: Notification[];
  hasReadNotifications: boolean;
  onLoadMore: () => void;
};

const UnreadNotificationsList = ({
  unreadNotifications,
  hasReadNotifications,
  onLoadMore,
}: UnreadListProps) => {
  if (unreadNotifications.length === 0) return null;
  return (
    <>
      <View style={{ gap: 20 }}>
        {unreadNotifications.map((item) => (
          <HospiceNotification key={item._id} notification={item} />
        ))}
        {hasReadNotifications && (
          <View
            style={{
              width: '100%',
              height: 2,
              marginTop: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            }}
          />
        )}
      </View>
    </>
  );
};

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
  const ref = useScrollToTop();
  const unreadNotifications = results.filter((item) => !item.isRead);
  const readNotifications = results.filter((item) => item.isRead);
  const onLoadMore = useCallback(() => {
    if (status === 'CanLoadMore') {
      loadMore(25);
    }
  }, [status, loadMore]);
  const renderReadItem = ({
    item,
  }: LegendListRenderItemProps<Notification>) => (
    <HospiceNotification notification={item} />
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
  if (status === 'LoadingFirstPage') {
    return <SmallLoader size={50} />;
  }
  return (
    <LegendList
      data={readNotifications}
      scrollEventThrottle={16}
      ListHeaderComponent={
        <UnreadNotificationsList
          unreadNotifications={unreadNotifications}
          hasReadNotifications={readNotifications.length > 0}
          onLoadMore={onLoadMore}
        />
      }
      ref={ref}
      renderItem={renderReadItem}
      onEndReached={onLoadMore}
      keyExtractor={(item) => item._id}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      recycleItems
      contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
      ListFooterComponent={
        status === 'LoadingMore' ? <SmallLoader size={15} /> : null
      }
      ListEmptyComponent={
        unreadNotifications.length === 0 ? (
          <Text style={{ textAlign: 'center', fontSize: 20 }}>
            No notifications found.
          </Text>
        ) : null
      }
    />
  );
};
