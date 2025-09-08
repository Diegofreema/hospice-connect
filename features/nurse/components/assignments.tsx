import { Doc } from '@/convex/_generated/dataModel';
import { ActionComponent } from '@/features/shared/components/action-component';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { LegendList } from '@legendapp/list';
import { Text } from 'react-native';

type Props = {
  data: Doc<'assignments'>[];
  handleMore: () => void;
  isLoadingMore: boolean;
  title?: string;
  description?: string;
};
export const AssignmentsForNurses = ({
  data,
  handleMore,
  isLoadingMore,
  description = 'Please check in later.',
  title = 'No available assignments',
}: Props) => {
  return (
    <LegendList
      data={data}
      renderItem={({ item }) => <Text>{item.patientFirstName}</Text>}
      keyExtractor={(item) => item._id}
      onEndReached={handleMore}
      onEndReachedThreshold={0.5}
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
