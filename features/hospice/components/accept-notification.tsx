import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { FlexButtons } from '@/features/shared/components/flex-buttons';
import { generateErrorMessage } from '@/features/shared/utils';
import { useMutation } from 'convex/react';
import React, { useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface ApproveRouteSheetModalProps {
  visible: boolean;
  onClose: () => void;

  routeSheetId: Id<'routeSheets'>;
  hospiceId: Id<'hospices'>;
}

export const ApproveRouteSheetModal: React.FC<ApproveRouteSheetModalProps> = ({
  visible,
  onClose,

  hospiceId,
  routeSheetId,
}) => {
  const [processing, setProcessing] = useState(false);
  const approve = useMutation(api.routeSheets.approveOrDeclineRouteSheet);
  const { showToast } = useToast();

  const handleClose = () => {
    onClose();
  };

  const onApprove = async () => {
    setProcessing(true);
    try {
      await approve({
        routeSheetId,
        isApproved: true,
        hospiceId,
      });

      showToast({
        title: 'Success',
        subtitle: 'Route sheet approved successfully',
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to approve route sheet'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setProcessing(false);
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
            <Text style={styles.title}>Approve</Text>

            <Text style={styles.description}>
              Are you sure you want to Approve this route sheet?
            </Text>

            <FlexButtons
              onCancel={handleClose}
              onPress={onApprove}
              disabled={processing}
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
