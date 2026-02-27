import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { useAction } from 'convex/react';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { toast } from 'sonner-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  nurseId: Id<'nurses'>;
  clientSecret: string;
  stripeCustomerId: string;
  onSuccess: () => void;
};

export const AddPaymentMethodModal = ({
  visible,
  onClose,
  nurseId,
  clientSecret,
  stripeCustomerId,
  onSuccess,
}: Props) => {
  const { theme } = useUnistyles();
  const { confirmSetupIntent } = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const addPaymentMethod = useAction(api.nursePaymentsActions.addPaymentMethod);

  const handleAdd = useCallback(async () => {
    if (!cardComplete) {
      toast.error('Incomplete card', {
        description: 'Please fill in all card details.',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Confirm the SetupIntent with the card entered by the user
      const { setupIntent, error } = await confirmSetupIntent(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!setupIntent?.paymentMethodId) {
        throw new Error('No payment method returned from Stripe');
      }

      // Save to our backend
      await addPaymentMethod({
        nurseId,
        paymentMethodId: setupIntent.paymentMethodId,
        stripeCustomerId,
      });

      toast.success('Card saved successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('Failed to save card', {
        description: err?.message ?? 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    cardComplete,
    clientSecret,
    confirmSetupIntent,
    addPaymentMethod,
    nurseId,
    stripeCustomerId,
    onSuccess,
    onClose,
  ]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.sheet, { backgroundColor: theme.colors.background }]}
        >
          {/* Handle */}
          <View
            style={[styles.handle, { backgroundColor: theme.colors.grey }]}
          />

          <Text style={[styles.title, { color: theme.colors.typography }]}>
            Add Payment Card
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textGrey }]}>
            Your card will be used for commission billing when route sheets are
            approved.
          </Text>

          {/* Stripe native card input */}
          <View
            style={[
              styles.cardFieldWrap,
              {
                borderColor: theme.colors.grey,
                backgroundColor: theme.colors.greyLight,
              },
            ]}
          >
            <CardField
              postalCodeEnabled={false}
              placeholders={{ number: '4242 4242 4242 4242' }}
              cardStyle={{
                backgroundColor: 'transparent',
                textColor: theme.colors.typography,
                placeholderColor: theme.colors.textGrey,
                borderColor: 'transparent',
              }}
              style={styles.cardField}
              onCardChange={(details) => {
                setCardComplete(details.complete);
              }}
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleAdd}
              disabled={isLoading || !cardComplete}
              style={[
                styles.primaryBtn,
                {
                  backgroundColor:
                    !cardComplete || isLoading
                      ? theme.colors.grey
                      : theme.colors.blue,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Save Card</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              disabled={isLoading}
              style={[styles.cancelBtn, { borderColor: theme.colors.grey }]}
            >
              <Text
                style={[styles.cancelBtnText, { color: theme.colors.textGrey }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.secureNote, { color: theme.colors.textGrey }]}>
            🔒 Secured by Stripe — we never store your full card number.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create(() => ({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end' as const,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 14,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center' as const,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'PublicSansBold',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'PublicSansRegular',
    lineHeight: 18,
    marginTop: -4,
  },
  cardFieldWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  cardField: {
    width: '100%' as any,
    height: 50,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
  primaryBtn: {
    borderRadius: 13,
    paddingVertical: 15,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'PublicSansBold',
  },
  cancelBtn: {
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: 'center' as const,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: 'PublicSansRegular',
  },
  secureNote: {
    fontSize: 11,
    fontFamily: 'PublicSansRegular',
    textAlign: 'center' as const,
    marginTop: 4,
  },
}));
