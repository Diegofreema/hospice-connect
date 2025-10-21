import { ActionComponent } from '@/features/shared/components/action-component';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { LegendList } from '@legendapp/list';
import { AvailableAssignmentType } from '../types';
import { AssignmentAvailableCard } from './assignment-card';

type Props = {
  data: AvailableAssignmentType[];
  handleMore: () => void;
  isLoadingMore: boolean;
  title?: string;
  description?: string;
  onOpenSheet: () => void;
};
export const AssignmentsForNurses = ({
  data,
  handleMore,
  isLoadingMore,
  description = 'Please check in later.',
  title = 'No available assignments',
  onOpenSheet,
}: Props) => {
  return (
    <>
      <LegendList
        data={data}
        renderItem={({ item }) => (
          <AssignmentAvailableCard onOpenSheet={onOpenSheet} item={item} />
        )}
        keyExtractor={(item) => item._id}
        onEndReached={handleMore}
        onEndReachedThreshold={0.5}
        style={{ paddingHorizontal: 15 }}
        columnWrapperStyle={{ gap: 20 }}
        contentContainerStyle={{ gap: 20, paddingBottom: 100 }}
        recycleItems
        ListFooterComponent={isLoadingMore ? <SmallLoader /> : null}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ActionComponent
            title={title}
            description={description}
            imageUrl={require('@/assets/images/review.png')}
          />
        }
      />
    </>
  );
};
