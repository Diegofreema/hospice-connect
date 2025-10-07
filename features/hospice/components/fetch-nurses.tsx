import { api } from '@/convex/_generated/api';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { usePaginatedQuery } from 'convex/react';

import { Title } from '@/components/title/Title';

import { Stack } from '@/features/shared/components/v-stack';
import { LegendList } from '@legendapp/list';
import { format } from 'date-fns';
import { NurseType } from '../types';
import { NurseCard } from './nurse-card';

type Props = {
  nurseType: 'All' | NurseType;
  rate1: number;
  rate2: number;
  isAssigned?: boolean;
  onAction?: () => void;
};

export const FetchNurses = ({
  nurseType,
  rate1,
  rate2,
  isAssigned,
  onAction,
}: Props) => {
  const todayToText = format(new Date(), 'EEEE');

  const { loadMore, results, status } = usePaginatedQuery(
    api.nurses.getNurses,
    { discipline: nurseType, range1: rate1, range2: rate2, todayToText },
    { initialNumItems: 30 }
  );
  const onLoadMore = () => {
    if (status === 'CanLoadMore') {
      loadMore(30);
    }
  };

  if (status === 'LoadingFirstPage') {
    return <SmallLoader size={50} />;
  }

  return (
    <Stack flex={1}>
      <LegendList
        ListHeaderComponent={<Title size={20}>Nurses</Title>}
        data={results}
        recycleItems
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <NurseCard nurse={item} isAssigned={isAssigned} onAction={onAction} />
        )}
        keyExtractor={(item) => item._id}
        ListFooterComponent={status === 'LoadingMore' ? <SmallLoader /> : null}
        contentContainerStyle={{ gap: 20, paddingBottom: 100, flexGrow: 1 }}
        columnWrapperStyle={{ gap: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Title textAlign="center" size={20}>
            No nurses found
          </Title>
        }
        style={{ flex: 1 }}
      />
    </Stack>
  );
};
