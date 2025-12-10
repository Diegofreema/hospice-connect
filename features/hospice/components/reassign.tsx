import { useHospice } from '@/components/context/hospice-context';
import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { FetchNurses } from '@/features/hospice/components/fetch-nurses';
import { RateRange } from '@/features/hospice/components/rate-range';
import { BackButton } from '@/features/shared/components/back-button';
import { CustomSheet } from '@/features/shared/components/custom-bottom-sheet';
import { PressableIcon } from '@/features/shared/components/pressable-icon';
import { SearchComponent } from '@/features/shared/components/search-component';
import { Stack } from '@/features/shared/components/v-stack';
import { Wrapper } from '@/features/shared/components/wrapper';
import { generateErrorMessage } from '@/features/shared/utils';
import BottomSheet from '@gorhom/bottom-sheet';
import { IconFilter2 } from '@tabler/icons-react-native';
import { useMutation } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';
import { useGetNurseId } from '../hooks/use-get-nurse-id';

export const Reassign = () => {
  const { hospice } = useHospice();
  const { id, discipline, oldNurseId } = useLocalSearchParams<{
    id: Id<'schedules'>;
    discipline: 'RN' | 'LVN' | 'HHA';
    oldNurseId: Id<'nurses'>;
  }>();
  const [sending, setSending] = useState(false);
  const sendReassignmentNotification = useMutation(
    api.assignments.sendReassignmentNotification
  );
  const [range, setRange] = useState({
    rate1: '5',
    rate2: '1000',
  });
  const { showToast } = useToast();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const nurseId = useGetNurseId((state) => state.id);

  const onOpenSheet = () => {
    bottomSheetRef.current?.expand();
  };
  const onReassign = async () => {
    console.log({ id, hospice, nurseId });

    if (!hospice || !hospice?._id || !nurseId) return;
    console.log('Pressed');
    setSending(true);
    try {
      await sendReassignmentNotification({
        scheduleId: id,
        hospiceId: hospice._id,
        nurseId,
        hospiceName: hospice.businessName as string,
      });
      showToast({
        title: 'Success',
        subtitle: 'Reassign notification sent successfully',
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Error sending reassignment notification'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setSending(false);
    }
  };
  const onCloseSheet = () => {
    bottomSheetRef.current?.close();
  };

  if (hospice === null) return null;
  return (
    <>
      <Wrapper>
        <BackButton title="Reassign" marginTop={0} />
        <Stack gap={'lg'} mode="flexCentered">
          <SearchComponent
            placeholder="Search for nurses"
            path={`/search-nurses?discipline=${discipline}&id=${id}`}
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
          onAction={() => onReassign()}
          nurseId={oldNurseId}
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
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  icon: {
    backgroundColor: theme.colors.buttonGrey,
    borderRadius: 8,
    padding: 14,
  },
}));
