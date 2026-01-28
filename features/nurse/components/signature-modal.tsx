import { CustomPressable } from '@/features/shared/components/custom-pressable';
import SignatureComponent from '@/features/shared/components/signature-component';
import { Text } from '@/features/shared/components/text';
import { ViewSignature } from '@/features/shared/components/view-signature';
import { IconX } from '@tabler/icons-react-native';
import React, { useRef } from 'react';
import { type FieldErrors } from 'react-hook-form';
import { Modal, View } from 'react-native';
import { type SignatureViewRef } from 'react-native-signature-canvas';
import { StyleSheet } from 'react-native-unistyles';
import { type RouteSheetValidator } from '../validators';

interface SignatureModalProps {
  visible: boolean;
  onClose: () => void;

  onClear: () => void;
  onOK: (signature: string) => void;
  errors: FieldErrors<RouteSheetValidator>;
  signature: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  visible,
  onClose,

  onClear,
  onOK,
  errors,
  signature,
}) => {
  const ref = useRef<SignatureViewRef>(null);
  const handleClose = () => {
    onClose();
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
            <Text style={styles.title}>Signature</Text>
            <CustomPressable onPress={handleClose} style={styles.close}>
              <IconX color={'black'} size={25} />
            </CustomPressable>
            <Text style={styles.description}>
              Please sign your signature below.
            </Text>

            <View style={styles.signatureContainer}>
              {signature ? (
                <>
                  <ViewSignature signature={signature} />
                  <CustomPressable onPress={onClear} style={styles.retake}>
                    <Text size="normal" isBold>
                      Retake
                    </Text>
                  </CustomPressable>
                </>
              ) : (
                <>
                  <SignatureComponent ref={ref} onOK={onOK} onClear={onClear} />
                  {errors.signature?.message && (
                    <Text size="small" color={'red'}>
                      {typeof errors['signature']?.message === 'string'
                        ? errors['signature']?.message
                        : 'Invalid input'}
                    </Text>
                  )}
                </>
              )}
            </View>
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
    flex: 1,
    maxHeight: 400,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    flex: 1,
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
  signatureContainer: {
    marginBottom: 24,
    flex: 1,
  },

  retake: {
    alignSelf: 'center',
    marginTop: 10,
  },
  close: {
    position: 'absolute',
    top: 20,
    right: 15,
  },
});
