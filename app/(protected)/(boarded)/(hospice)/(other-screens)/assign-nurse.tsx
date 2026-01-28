import { useHospice } from '@/components/context/hospice-context';
import { type Id } from '@/convex/_generated/dataModel';
import { FetchNurses } from '@/features/hospice/components/fetch-nurses';
import { RateRange } from '@/features/hospice/components/rate-range';
import { SelectSchedule } from '@/features/hospice/components/select-schedule';
import { useGetNurseId } from '@/features/hospice/hooks/use-get-nurse-id';
import { BackButton } from '@/features/shared/components/back-button';
import { CustomSheet } from '@/features/shared/components/custom-bottom-sheet';
import { PressableIcon } from '@/features/shared/components/pressable-icon';
import { SearchComponent } from '@/features/shared/components/search-component';
import { Stack } from '@/features/shared/components/v-stack';
import { Wrapper } from '@/features/shared/components/wrapper';
import type BottomSheet from '@gorhom/bottom-sheet';
import { IconFilter2 } from '@tabler/icons-react-native';
import { useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';

const AssignNurse = () => {
  const { hospice } = useHospice();
  const { id, discipline } = useLocalSearchParams<{
    id: Id<'assignments'>;
    discipline: 'RN' | 'LVN' | 'HHA';
  }>();

  const clearNurseId = useGetNurseId((state) => state.clear);
  const [range, setRange] = useState({
    rate1: '5',
    rate2: '1000',
  });
  const bottomSheetRef = useRef<BottomSheet>(null);
  const scheduleBottomSheetRef = useRef<BottomSheet>(null);

  const onOpenSheet = () => {
    bottomSheetRef.current?.expand();
  };
  const onOpenScheduleSheet = () => {
    scheduleBottomSheetRef.current?.expand();
  };
  const onCloseSheet = () => {
    bottomSheetRef.current?.close();
  };
  const onCloseScheduleSheet = () => {
    scheduleBottomSheetRef.current?.close();
    clearNurseId();
  };
  if (hospice === null) return null;
  return (
    <>
      <Wrapper>
        <BackButton title="Assign" marginTop={0} />
        <Stack gap={'lg'} mode="flexCentered">
          <SearchComponent
            placeholder="Search for nurses"
            path={`/search-nurses?discipline=${discipline}`}
            isButton
          />
          <PressableIcon
            onPress={onOpenSheet}
            icon={IconFilter2}
            style={styles.icon}
          />
        </Stack>

        <FetchNurses
          nurseType={discipline}
          rate1={range.rate1}
          rate2={range.rate2}
          isAssigned
          onAction={onOpenScheduleSheet}
        />
      </Wrapper>
      <CustomSheet
        title="Filter"
        customSnapPoints={['50%']}
        ref={bottomSheetRef}
        onClose={onCloseSheet}
      >
        <RateRange setRange={setRange} range={range} />
      </CustomSheet>
      <CustomSheet
        title="Choose Schedule"
        ref={scheduleBottomSheetRef}
        onClose={onCloseScheduleSheet}
        customSnapPoints={['70%']}
      >
        <SelectSchedule
          id={id}
          hospiceId={hospice._id!}
          name={hospice.businessName!}
          onClose={onCloseScheduleSheet}
        />
      </CustomSheet>
    </>
  );
};

export default AssignNurse;

const styles = StyleSheet.create((theme) => ({
  icon: {
    backgroundColor: theme.colors.buttonGrey,
    borderRadius: 8,
    padding: 14,
  },
}));
