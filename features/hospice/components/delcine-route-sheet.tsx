import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { FlexButtons } from '@/features/shared/components/flex-buttons';
import { generateErrorMessage } from '@/features/shared/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Modal, Text, TextInput, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { z } from 'zod';

interface DeclineRouteSheetModalProps {
  visible: boolean;
  onClose: () => void;

  routeSheetId: Id<'routeSheets'>;
  hospiceId: Id<'hospices'>;
    notificationId: Id<'hospiceNotifications'>;
}

const formValidator = z.object({
  reason: z.string().min(1, 'Reason is required'),
});
type FormData = z.infer<typeof formValidator>;

export const DeclineRouteSheetModal: React.FC<DeclineRouteSheetModalProps> = ({
  visible,
  onClose,

  hospiceId,
  routeSheetId,
    notificationId
}) => {
  const approveOrDecline = useMutation(
    api.routeSheets.approveOrDeclineRouteSheet
  );
  const { showToast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      reason: '',
    },
    resolver: zodResolver(formValidator),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    try {
      await approveOrDecline({
        routeSheetId,
        isApproved: false,
        hospiceId,
        reason: data.reason,
          notificationId
      });

      showToast({
        title: 'Success',
        subtitle: 'Route sheet declined successfully',
        autodismiss: true,
      });

      onClose();
      reset();
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to decline route sheet'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Decline</Text>

            <Text style={styles.description}>
              Are you sure you want to decline this route sheet?
            </Text>
            <Text style={{ marginBottom: 10 }}>Reason</Text>
            <View style={styles.inputContainer}>
              <Controller
                control={control}
                name="reason"
                rules={{
                  required: 'Reason is required',
                  minLength: {
                    value: 3,
                    message: 'Reason must be at least 3 characters',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.reason && styles.textInputError,
                    ]}
                    placeholder="State your reason for cancelling"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.reason && (
                <Text style={styles.errorText}>{errors.reason.message}</Text>
              )}
            </View>

            <FlexButtons
              onCancel={handleClose}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              buttonText="No"
              buttonText2="Yes"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1a1a1a',
    minHeight: 100,
  },
  textInputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
});
