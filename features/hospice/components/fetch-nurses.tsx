import { api } from '@/convex/_generated/api';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { usePaginatedQuery } from 'convex/react';

import { Title } from '@/components/title/Title';

import { Id } from '@/convex/_generated/dataModel';
import { Stack } from '@/features/shared/components/v-stack';
import { sortedArrayByAvailability } from '@/features/shared/utils';
import { LegendList } from '@legendapp/list';
import { format } from 'date-fns';
import { NurseType } from '../types';
import { NurseCard } from './nurse-card';

type Props = {
  nurseType: 'All' | NurseType;
  rate1: string;
  rate2: string;
  isAssigned?: boolean;
  onAction?: () => void;
  nurseId?: Id<'nurses'> | null;
};

export const FetchNurses = ({
  nurseType,
  rate1,
  rate2,
  isAssigned,
  onAction,
  nurseId,
}: Props) => {
  const todayToText = format(new Date(), 'EEEE');

  const { loadMore, results, status } = usePaginatedQuery(
    api.nurses.getNurses,
    {
      discipline: nurseType,
      range1: +rate1,
      range2: +rate2,
      todayToText,
      nurseId,
    },
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
  const sortedResults = sortedArrayByAvailability(results);

  return (
    <Stack flex={1}>
      <LegendList
        ListHeaderComponent={<Title size={20}>Healthcare Professionals</Title>}
        data={sortedResults}
        recycleItems
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <NurseCard
            nurse={item}
            isAssigned={isAssigned}
            onAction={onAction ? () => onAction() : undefined}
          />
        )}
        keyExtractor={(item) => item._id}
        ListFooterComponent={status === 'LoadingMore' ? <SmallLoader /> : null}
        contentContainerStyle={{ gap: 20, paddingBottom: 50, flexGrow: 1 }}
        columnWrapperStyle={{ gap: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Title textAlign="center" size={20}>
            No professionals found.
          </Title>
        }
        style={{ flex: 1 }}
      />
    </Stack>
  );
};
