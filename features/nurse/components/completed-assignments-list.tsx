import { type api } from '@/convex/_generated/api';
import { ActionComponent } from '@/features/shared/components/action-component';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { LegendList } from '@legendapp/list';
import { type FunctionReturnType } from 'convex/server';
import React from 'react';
import { CompletedCard } from './completed-card';

type Props = {
  data: FunctionReturnType<typeof api.assignments.completedAssignments>['page'];
  handleMore: () => void;
  isLoadingMore: boolean;
  title?: string;
  description?: string;
};

export const CompletedAssignmentsList = ({
  data,
  handleMore,
  isLoadingMore,
  description = 'Please check in later.',
  title = 'No available assignments',
}: Props) => {
  return (
    <LegendList
      data={data}
      renderItem={({ item }) => <CompletedCard item={item} />}
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
