import { useNurse } from '@/components/context/nurse-context';
import { Title } from '@/components/title/Title';
import { api } from '@/convex/_generated/api';
import { Button } from '@/features/shared/components/button';
import Text from '@/features/shared/components/text';
import View from '@/features/shared/components/view';
import { generateErrorMessage } from '@/features/shared/utils';
import { useToast } from '@/hooks/use-toast';
import { palette } from '@/theme';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconX } from '@tabler/icons-react-native';
import { useMutation } from 'convex/react';
import { format } from 'date-fns';
import { Checkbox } from 'expo-checkbox';
import { forwardRef, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { useNurseSheet } from '../lib/zustand/use-nurse-sheet';
type Props = {
  onClose: () => void;
};

export const AvailabilitySheet = forwardRef<BottomSheet, Props>(
  ({ onClose }, ref) => {
    const snapPoints = useMemo(() => ['25%', '40%'], []);
    const { nurse } = useNurse();
    const [loading, setLoading] = useState(false);
    const updateTime = useMutation(
      api.nurses.updateNurseStartAndEndTimeAvailability
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
        onClose();
      } catch (error) {
        const errorMessage = generateErrorMessage(
          error,
          'Failed to update availability'
        );

        showToast({
          title: 'Error',
          description: errorMessage,
          type: 'error',
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
              <IconX size={20} color={palette.blue} />
            </TouchableOpacity>
          </View>
          <View
            p={'m'}
            backgroundColor={'cardBackground'}
            borderRadius={8}
            gap={'s'}
          >
            <View gap={'m'} flexDirection={'row'} alignItems={'center'}>
              <Checkbox value={item.available} style={styles.checkBox} />
              <Text variant={'small'} fontFamily={'PublicSansSemiBold'}>
                {item.day}
              </Text>
            </View>
            <View flexDirection={'row'} gap={'s'}>
              <View flex={1}>
                <Text variant={'small'}>Time Begin</Text>
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
                <Text variant={'small'}>Time End</Text>
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
          <View
            flexDirection={'row'}
            gap={'m'}
            alignItems={'center'}
            style={{ marginTop: 30 }}
          >
            <Button
              label="Cancel"
              onPress={onClose}
              backgroundColor={'transparent'}
              borderWidth={1}
              borderColor={'borderColor'}
              color={'blue'}
            />
            <Button
              label="Apply"
              onPress={onUpdateAvailability}
              loading={loading}
              disabled={loading}
              loadingText="Updating"
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

AvailabilitySheet.displayName = 'AvailabilitySheet';

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingVertical: 36,
    paddingHorizontal: 10,
    gap: 10,
  },
  closeButton: {
    borderWidth: 1,
    borderColor: palette.grey,
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
    borderColor: palette.grey,
    width: '100%',
    flex: 1,
  },
});
