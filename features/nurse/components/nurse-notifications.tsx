import { Title } from '@/components/title/Title';
import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { useScrollToTop } from '@/features/shared/hooks/use-scroll-to-top';
import { LegendList, type LegendListRenderItemProps } from '@legendapp/list';
import { useMutation, usePaginatedQuery } from 'convex/react';
import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { NurseNotification } from './nurse-notification';

type Notification = ReturnType<
  typeof usePaginatedQuery<typeof api.nurseNotifications.getNurseNotifications>
>['results'][number];

type HeaderProps = {
  unreadNotifications: Notification[];
  hasReadNotifications: boolean;
  onLoadMore: () => void;
};

const UnreadNotificationsList = ({
  unreadNotifications,
  hasReadNotifications,
  onLoadMore,
}: HeaderProps) => {
  if (unreadNotifications.length === 0) return null;
  return (
    <>
      <View style={{ gap: 20 }}>
        {unreadNotifications.map((item) => (
          <NurseNotification key={item._id} notification={item} />
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
  nurseId: Id<'nurses'>;
};

export const FetchNurseNotification = ({ nurseId }: Props) => {
  const { results, loadMore, status } = usePaginatedQuery(
    api.nurseNotifications.getNurseNotifications,
    {
      nurseId,
    },
    { initialNumItems: 25 },
  );
  const ref = useScrollToTop();
  const markNotificationAsRead = useMutation(
    api.nurseNotifications.markNotificationAsRead,
  );
  const unreadNotifications = results.filter((item) => !item.isRead);
  const readNotifications = results.filter((item) => item.isRead);
  const onLoadMore = useCallback(() => {
    if (status === 'CanLoadMore') {
      loadMore(25);
    }
  }, [status, loadMore]);
  const renderReadItem = useCallback(
    ({ item }: LegendListRenderItemProps<Notification>) => (
      <NurseNotification notification={item} />
    ),
    [],
  );
  const ListHeaderComponent = useCallback(
    () => (
      <UnreadNotificationsList
        unreadNotifications={unreadNotifications}
        hasReadNotifications={readNotifications.length > 0}
        onLoadMore={onLoadMore}
      />
    ),
    [unreadNotifications, readNotifications.length, onLoadMore],
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
  return (
    <LegendList
      scrollEventThrottle={16}
      ListHeaderComponent={ListHeaderComponent}
      ref={ref}
      data={readNotifications}
      renderItem={renderReadItem}
      onEndReached={onLoadMore}
      keyExtractor={(item) => item._id}
      onEndReachedThreshold={0.5}
      recycleItems
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 20, paddingBottom: 100 }}
      ListFooterComponent={
        status === 'LoadingMore' ? <SmallLoader size={15} /> : null
      }
      ListEmptyComponent={
        unreadNotifications.length === 0 ? (
          <Title textAlign="center" size={20}>
            No notifications found.
          </Title>
        ) : null
      }
    />
  );
};
