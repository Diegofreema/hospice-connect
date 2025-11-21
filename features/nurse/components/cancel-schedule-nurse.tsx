import React, { useState } from 'react';

import { useGetScheduleId } from '../../hospice/hooks/use-get-schedule-id';

import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import BottomSheetKeyboardAwareScrollView from '@/features/shared/components/bottom-sheet-aware-scroll-view';
import { Button } from '@/features/shared/components/button';
import { CustomPressable } from '@/features/shared/components/custom-pressable';
import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';
import { generateErrorMessage } from '@/features/shared/utils';
import { IconCircle, IconCircleCheckFilled } from '@tabler/icons-react-native';
import { useMutation } from 'convex/react';
import { Platform, TextInput } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  onClose: () => void;
  nurseId: Id<'nurses'>;
};

const CancelScheduleNurse = ({ onClose, nurseId }: Props) => {
  const id = useGetScheduleId((state) => state.id);
  const cancelRequest = useMutation(
    api.hospiceNotification.cancelShiftNotification
  );
  const [selected, setSelected] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const { showToast } = useToast();
  const handleSubmit = async () => {
    if (!id) return;
    setSubmitting(true);

    try {
      await cancelRequest({
        nurseId,
        shiftId: id,
        reason: selected === 'other' ? reason : selected,
      });
      showToast({
        title: 'Success',
        subtitle: 'Shift cancellation request sent',
        autodismiss: true,
      });
      onClose();
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to send cancellation request'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <BottomSheetKeyboardAwareScrollView showsVerticalScrollIndicator={false}>
      {/* <BottomSheetFlatList
        data={data}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Reason
            item={item}
            selected={selected}
            setSelected={setSelected}
            reason={reason}
            setReason={setReason}
          />
        )}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        style={{ marginTop: 20 }}
        contentContainerStyle={{ gap: 20, paddingBottom: 50 }} */}

      <View style={{ gap: 10, marginTop: 20, paddingBottom: 50 }}>
        {data.map((item) => (
          <Reason
            item={item}
            selected={selected}
            setSelected={setSelected}
            reason={reason}
            setReason={setReason}
            key={item.id}
          />
        ))}

        <Button title="Submit" onPress={handleSubmit} disabled={submitting} />
      </View>
    </BottomSheetKeyboardAwareScrollView>
  );
};

export default CancelScheduleNurse;

const data = [
  { id: 1, value: 'Patient expired', label: 'Patient expired' },
  { id: 2, value: 'Illness', label: 'Illness' },
  { id: 3, value: 'Family emergency', label: 'Family emergency' },
  { id: 4, value: 'other', label: 'Other' },
];

type ReasonProp = {
  item: (typeof data)[number];
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  reason: string;
  setReason: React.Dispatch<React.SetStateAction<string>>;
};
const Reason = ({
  item,
  selected,
  setSelected,
  reason,
  setReason,
}: ReasonProp) => {
  const isSelected = item.value === selected;

  const onSelect = () => {
    setSelected(item.value);
    setReason('');
  };
  return (
    <View style={styles.pressable} p="xxl">
      <CustomPressable onPress={onSelect}>
        <View flexDirection="row" gap="md" alignItems="center">
          {isSelected ? (
            <IconCircleCheckFilled size={25} color="blue" />
          ) : (
            <IconCircle size={25} color="grey" />
          )}
          <Text size="medium" isMedium>
            {item.label}
          </Text>
        </View>
      </CustomPressable>
      {selected === 'other' && item.value === 'other' && (
        <View style={styles.container}>
          <TextInput
            placeholder="State reason"
            value={reason}
            onChangeText={setReason}
            style={styles.textarea}
            multiline
            numberOfLines={Platform.OS === 'ios' ? 1 : 6}
            textAlignVertical="top"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  pressable: {
    borderColor: theme.colors.grey,
    borderWidth: 1,
    borderRadius: 10,
  },
  textarea: {
    fontSize: 16,
    color: '#333',
    marginTop: 15,
    minHeight: 96,
    ...Platform.select({
      ios: {
        paddingTop: 8,
      },
      android: {
        paddingTop: 0,
        textAlignVertical: 'top',
      },
    }),
    backgroundColor: theme.colors.greyLight,
    padding: theme.paddings.xl,
  },
  container: {
    // paddingTop: rt.insets.top,
  },
}));
