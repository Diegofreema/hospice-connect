import { useNurse } from '@/components/context/nurse-context';
import { DayType } from '@/convex/helper';
import { SmallLoader } from '@/features/shared/components/small-loader';

import { Stack } from '@/features/shared/components/v-stack';
import BottomSheet from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { FlatList } from 'react-native';
import { useNurseSheet } from '../lib/zustand/use-nurse-sheet';
import { AvailabilitySheet } from './availability-sheet';
import { Day } from './day';

export const Availability = () => {
  const { nurse } = useNurse();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const setData = useNurseSheet((state) => state.setDay);
  if (nurse === undefined) {
    return <SmallLoader size={50} />;
  }
  const handlePress = (day: DayType) => {
    setData(day);
    bottomSheetRef.current?.expand();
  };
  const handleClose = () => {
    bottomSheetRef.current?.close();
  };
  return (
    <>
      <Stack flex={1} mt="md">
        <FlatList
          data={nurse?.availabilities?.days}
          renderItem={({ item }) => (
            <Day day={item} onPress={() => handlePress(item)} />
          )}
          keyExtractor={(item, i) => item.day + i}
          contentContainerStyle={{ gap: 10 }}
          showsVerticalScrollIndicator={false}
        />
      </Stack>
      <AvailabilitySheet ref={bottomSheetRef} onClose={handleClose} />
    </>
  );
};
