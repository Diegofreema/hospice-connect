import { useNurse } from '@/components/context/nurse-context';
import { SegmentedControl } from '@/components/segmented-control';
import { api } from '@/convex/_generated/api';
import { useSelectAssignment } from '@/features/hospice/hooks/use-select-assignment';
import { AddedCardProvider } from '@/features/nurse/components/added-card-provider';
import { AvailableAssignments } from '@/features/nurse/components/available-assignments';
import CancelScheduleNurse from '@/features/nurse/components/cancel-schedule-nurse';
import { ChooseSchedule } from '@/features/nurse/components/choose-schedule';
import { CompletedAssignments } from '@/features/nurse/components/completed-assignments';
import { InProgressAssignments } from '@/features/nurse/components/in-progress-assignments';
import { ViewSchedule } from '@/features/nurse/components/view-schedule';
import { AccountBrief } from '@/features/shared/components/account-brief';
import { CustomSheet } from '@/features/shared/components/custom-bottom-sheet';
import { View } from '@/features/shared/components/view';
import type BottomSheet from '@gorhom/bottom-sheet';

import { useQuery } from 'convex/react';

import { useRef, useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';

type Variants = 'available' | 'in-progress' | 'completed';
export default function HomeScreen() {
  const { nurse, isSuspended, isPending, isRejected } = useNurse();
  const unreadCount = useQuery(
    api.nurseNotifications.unreadMessagesCount,
    nurse ? { nurseId: nurse._id } : 'skip',
  );
  const [selectedValue, setSelectedValue] = useState<Variants>('available');
  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetInProgressRef = useRef<BottomSheet>(null);
  const bottomSheetCancelRef = useRef<BottomSheet>(null);
  const clearSelected = useSelectAssignment((state) => state.clear);
  const onCloseSheet = () => {
    bottomSheetRef.current?.close();
    clearSelected();
  };
  const onCloseSheetCancelSchedule = () => {
    bottomSheetCancelRef.current?.close();
  };

  const onCloseSheetInProgress = () => {
    bottomSheetInProgressRef.current?.close();
    clearSelected();
  };
  const onOpenSheet = () => {
    bottomSheetRef.current?.expand();
  };
  const onOpenSheetInProgress = () => {
    bottomSheetInProgressRef.current?.expand();
  };
  const onOpenSheetCancelSchedule = () => {
    bottomSheetInProgressRef.current?.close();
    bottomSheetCancelRef.current?.expand();
  };
  if (nurse === null) return null;
  const name = nurse.name;
  const isVerified = nurse.status === 'approved';

  return (
    <AddedCardProvider>
      <View flex={1} backgroundColor="white" gap="md">
        <View px="xl">
          <AccountBrief
            data={{ name, image: nurse.image as string }}
            isHome
            count={unreadCount || 0}
            verified={isVerified}
          />
        </View>
        <View px="xl">
          <SegmentedControl.Root
            value={selectedValue}
            onValueChange={(value) => setSelectedValue(value as Variants)}
          >
            <SegmentedControl.Item
              value="available"
              style={[
                styles.normal,
                selectedValue === 'available' && styles.active,
              ]}
            >
              Available
            </SegmentedControl.Item>
            <SegmentedControl.Item
              value="in-progress"
              style={[
                styles.normal,
                selectedValue === 'in-progress' && styles.active,
              ]}
            >
              In Progress
            </SegmentedControl.Item>
            <SegmentedControl.Item
              value="completed"
              style={[
                styles.normal,
                selectedValue === 'completed' && styles.active,
              ]}
            >
              Completed
            </SegmentedControl.Item>
          </SegmentedControl.Root>
        </View>
        {selectedValue === 'available' && (
          <AvailableAssignments
            nurseId={nurse._id}
            onOpenSheet={onOpenSheet}
            discipline={nurse.discipline}
            isSuspended={isSuspended}
            isPending={isPending}
            isRejected={isRejected}
          />
        )}
        {selectedValue === 'in-progress' && (
          <InProgressAssignments
            nurseId={nurse._id}
            onOpenSheet={onOpenSheetInProgress}
          />
        )}
        {selectedValue === 'completed' && (
          <CompletedAssignments nurseId={nurse._id} />
        )}
        <CustomSheet
          ref={bottomSheetRef}
          onClose={onCloseSheet}
          title="Choose Schedule"
          customSnapPoints={['25%', '60%']}
        >
          <ChooseSchedule onClose={onCloseSheet} nurseId={nurse._id!} />
        </CustomSheet>
        <CustomSheet
          ref={bottomSheetInProgressRef}
          onClose={onCloseSheetInProgress}
          title="View Schedule"
          customSnapPoints={['25%', '60%']}
        >
          <ViewSchedule
            onClose={onCloseSheetInProgress}
            nurseId={nurse._id!}
            onOpenSheetCancelSchedule={onOpenSheetCancelSchedule}
          />
        </CustomSheet>
        <CustomSheet
          ref={bottomSheetCancelRef}
          onClose={onCloseSheetCancelSchedule}
          title="Cancel Schedule"
          subTitle="Please state the reason you want to cancel the schedule"
          customSnapPoints={['90%']}
        >
          <CancelScheduleNurse
            onClose={onCloseSheetCancelSchedule}
            nurseId={nurse._id}
          />
        </CustomSheet>
      </View>
    </AddedCardProvider>
  );
}

const styles = StyleSheet.create((theme) => ({
  active: {
    borderBottomColor: theme.colors.blue,
  },
  normal: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#ccc',
    flex: 1,
  },
}));
