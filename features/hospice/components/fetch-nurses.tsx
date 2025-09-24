import { api } from '@/convex/_generated/api';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { usePaginatedQuery } from 'convex/react';

import View from '@/features/shared/components/view';
import { LegendList } from '@legendapp/list';
import { NurseType } from '../types';
import { NurseCard } from './nurse-card';

type Props = {
  nurseType: 'All' | NurseType;
  rate1: number;
  rate2: number;
};

export const FetchNurses = ({ nurseType, rate1, rate2 }: Props) => {
  const { loadMore, results, status } = usePaginatedQuery(
    api.nurses.getNurses,
    { discipline: nurseType, range1: rate1, range2: rate2 },
    { initialNumItems: 30 }
  );
  const onLoadMore = () => {
    if (status === 'CanLoadMore') {
      loadMore(30);
    }
  };

  if (status === 'LoadingFirstPage') {
    return <SmallLoader />;
  }
  return (
    <View>
      <LegendList
        data={results}
        recycleItems
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => <NurseCard nurse={item} />}
        keyExtractor={(item) => item._id}
        ListFooterComponent={status === 'LoadingMore' ? <SmallLoader /> : null}
      />
    </View>
  );
};
