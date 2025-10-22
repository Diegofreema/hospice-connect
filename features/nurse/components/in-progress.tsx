import { ActionComponent } from '@/features/shared/components/action-component';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { LegendList } from '@legendapp/list';
import React from 'react';
import { AssignmentWithBusiness } from '../types';
import { InProgressCard } from './in-progress-card';

type Props = {
  data: AssignmentWithBusiness[];
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
    <LegendList
      data={data}
      renderItem={({ item }) => (
        <InProgressCard onOpenSheet={onOpenSheet} item={item} />
      )}
      keyExtractor={(item) => item._id}
      onEndReached={handleMore}
      onEndReachedThreshold={0.5}
      style={{ paddingHorizontal: 15 }}
      columnWrapperStyle={{ gap: 20 }}
      contentContainerStyle={{ gap: 20, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      recycleItems
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
