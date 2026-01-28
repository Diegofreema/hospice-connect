import { useNurse } from '@/components/context/nurse-context';
import { Title } from '@/components/title/Title';
import { api } from '@/convex/_generated/api';
import { Text } from '@/features/shared/components/text';

import { generateErrorMessage } from '@/features/shared/utils';

import { useToast } from '@/components/demos/toast';
import { FlexButtons } from '@/features/shared/components/flex-buttons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconX } from '@tabler/icons-react-native';
import { useMutation } from 'convex/react';
import { format } from 'date-fns';
import { Checkbox } from 'expo-checkbox';
import { forwardRef, useMemo, useState } from 'react';
import { Pressable, TouchableOpacity } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { View } from '../../../features/shared/components/view';
import { useNurseSheet } from '../lib/zustand/use-nurse-sheet';

type Props = {
  onClose: () => void;
};

export const AvailabilitySheet = forwardRef<BottomSheet, Props>(
  ({ onClose }, ref) => {
    const snapPoints = useMemo(() => ['25%', '40%'], []);
    const { nurse } = useNurse();
    const { theme } = useUnistyles();
    const [loading, setLoading] = useState(false);
    const updateTime = useMutation(
      api.nurses.updateNurseStartAndEndTimeAvailability,
    );
    const { showToast } = useToast();
    const [startTime, setStartTime] = useState(() => {
      const today = new Date();
      today.setHours(8, 0, 0, 0);
      return today;
    });

    const [endTime, setEndTime] = useState(() => {
      const today = new Date();
      today.setHours(8, 0, 0, 0);
      return new Date(today.getTime() + 12 * 60 * 60 * 1000); // Add 12 hours in milliseconds
    });

    const [show, setShow] = useState(false);
    const [show2, setShow2] = useState(false);
    const item = useNurseSheet((state) => state.item);
    const onUpdateAvailability = async () => {
      if (!nurse?._id) return;
      setLoading(true);
      try {
        await updateTime({
          day: item.day,
          startTime: startTime.getTime(),
          endTime: endTime.getTime(),
          nurseId: nurse._id,
        });
        showToast({
          title: 'Success',
          subtitle: 'Availability updated',
          autodismiss: true,
          key: `availability-${item.day} + ${Math.random() * 1000}`,
        });
        onClose();
      } catch (error) {
        const errorMessage = generateErrorMessage(
          error,
          'Failed to update availability',
        );

        showToast({
          title: 'Error',
          subtitle: errorMessage,
          autodismiss: true,
          key: `availability-${item.day} + ${Math.random() * 1000}`,
        });
      } finally {
        setLoading(false);
      }
    };
    const onChange = (event: any, selectedDate: any, type: string) => {
      const currentDate = selectedDate;
      if (type === 'startTime') {
        setShow(false);
        setStartTime(currentDate);
      } else {
        setShow2(false);
        setEndTime(currentDate);
      }
    };
    const showMode = () => {
      setShow(true);
    };
    const showMode2 = () => {
      setShow2(true);
    };
    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        handleComponent={null}
        backdropComponent={BottomSheetBackdrop}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View
            flexDirection={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Title style={{ fontFamily: 'PublicSansBold' }}>
              Select time for this day
            </Title>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconX size={20} color={theme.colors.blue} />
            </TouchableOpacity>
          </View>
          <View
            p={'xl'}
            backgroundColor={theme.colors.greyLight}
            borderRadius={'lg'}
            gap={'md'}
          >
            <View gap={'md'} flexDirection={'row'} alignItems={'center'}>
              <Checkbox value={item.available} style={styles.checkBox} />
              <Text size={'small'} isMedium>
                {item.day}
              </Text>
            </View>
            <View flexDirection={'row'} gap={'md'}>
              <View flex={1}>
                <Text size={'small'}>Time Begin</Text>
                <View flex={1}>
                  <Pressable onPress={showMode} style={styles.border}>
                    <Text>
                      {' '}
                      {`${format(startTime, 'HH:mm') || ' Opening Time'}`}{' '}
                    </Text>
                  </Pressable>
                </View>
              </View>
              <View flex={1}>
                <Text size={'small'}>Time End</Text>
                <View flex={1}>
                  <Pressable onPress={showMode2} style={styles.border}>
                    <Text>
                      {' '}
                      {`${format(endTime, 'HH:mm') || ' Closing Time'}`}{' '}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
          {show && (
            <>
              <DateTimePicker
                style={{ marginBottom: 20 }}
                display="spinner"
                testID="dateTimePicker"
                value={startTime}
                mode="time"
                is24Hour
                onChange={(event, selectedDate) =>
                  onChange(event, selectedDate, 'startTime')
                }
              />
            </>
          )}
          {show2 && (
            <DateTimePicker
              display="spinner"
              testID="dateTimePicker"
              value={endTime}
              mode="time"
              is24Hour
              onChange={(event, selectedDate) =>
                onChange(event, selectedDate, 'endTime')
              }
            />
          )}

          <FlexButtons
            onCancel={onClose}
            onPress={onUpdateAvailability}
            buttonText="Cancel"
            buttonText2="Apply"
            disabled={loading}
          />
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

AvailabilitySheet.displayName = 'AvailabilitySheet';

const styles = StyleSheet.create((theme) => ({
  contentContainer: {
    flex: 1,
    paddingVertical: 36,
    paddingHorizontal: 10,
    gap: 10,
  },
  closeButton: {
    borderWidth: 1,
    borderColor: theme.colors.grey,
    borderRadius: 100,
    padding: 5,
  },
  checkBox: {
    borderRadius: 100,
  },
  border: {
    backgroundColor: 'transparent',
    minHeight: 52,
    borderRadius: 5,
    paddingLeft: 5,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.grey,
    width: '100%',
    flex: 1,
  },
}));
