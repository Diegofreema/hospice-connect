import { useNurse } from '@/components/context/nurse-context';
import { LoadingComponent } from '@/features/shared/components/loading';
import View from '@/features/shared/components/view';
import { FlatList } from 'react-native';
import { AvailabilitySheet } from './availability-sheet';
import { Day } from './day';

export const Availability = () => {
  const { nurse } = useNurse();
  if (nurse === undefined) {
    return <LoadingComponent />;
  }
  return (
    <View flex={1} mt="m">
      <FlatList
        data={nurse?.availabilities?.days}
        renderItem={({ item }) => <Day day={item} />}
        keyExtractor={(item) => item.day}
        contentContainerStyle={{ gap: 10 }}
        showsVerticalScrollIndicator={false}
      />
      <AvailabilitySheet />
    </View>
  );
};
