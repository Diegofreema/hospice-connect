import { type api } from '@/convex/_generated/api';
import { ActionComponent } from '@/features/shared/components/action-component';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { type FunctionReturnType } from 'convex/server';
import React from 'react';
import { FlatList } from 'react-native';
import { InProgressCard } from './in-progress-card';

type Props = {
  data: FunctionReturnType<typeof api.shifts.getInProgressShifts>['page'];
  handleMore: () => void;
  isLoadingMore: boolean;
  title?: string;
  description?: string;
  onOpenSheet: () => void;
};

export const InProgress = ({
  data,
  handleMore,
  isLoadingMore,
  onOpenSheet,
  description = 'Please check available assignments.',
  title = 'No assignments in progress',
}: Props) => {
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <InProgressCard onOpenSheet={onOpenSheet} item={item} />
      )}
      keyExtractor={(item) => item._id}
      onEndReached={handleMore}
      onEndReachedThreshold={0.5}
      style={{ paddingHorizontal: 15 }}
      contentContainerStyle={{ gap: 20, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={isLoadingMore ? <SmallLoader /> : null}
      ListEmptyComponent={
        <ActionComponent
          title={title}
          description={description}
          imageUrl={require('@/assets/images/review.png')}
        />
      }
    />
  );
};
