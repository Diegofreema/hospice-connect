import { useAuth } from '@/components/context/auth';
import { useNurse } from '@/components/context/nurse-context';
import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import BottomSheetKeyboardAwareScrollView from '@/features/shared/components/bottom-sheet-aware-scroll-view';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { Details } from '@stripe/stripe-react-native/lib/typescript/src/types/components/CardFieldInput';
import { useAction } from 'convex/react';
import React, { forwardRef, useCallback, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { toast } from 'sonner-native';

type Props = {
  nurseId: Id<'nurses'>;
  clientSecret: string;
  stripeCustomerId: string;
  onSuccess: () => Promise<void> | void;
  onCloseModal: () => void;
};

export const AddPaymentMethodModal = forwardRef<BottomSheetModal, Props>(
  (
    {
      nurseId,
      clientSecret,
      stripeCustomerId,
      onSuccess,

      onCloseModal,
    },
    ref,
  ) => {
    const { theme } = useUnistyles();
    const { bottom } = useSafeAreaInsets();
    const { confirmSetupIntent } = useStripe();
    const [isLoading, setIsLoading] = useState(false);

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1) {
          onCloseModal();
        }
      },
      [onCloseModal],
    );

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );
    const [details, setDetails] = useState<Details>();
    const { user } = useAuth();
    const { nurse } = useNurse();
    const addPaymentMethod = useAction(
      api.nursePaymentsActions.addPaymentMethod,
    );

    const handleAdd = async () => {
      if (!user || !nurse) {
        toast.error('User or nurse not found');
        return;
      }
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
          paymentMethodData: {
            billingDetails: {
              email: user?.email,
              name: nurse?.name,
              phone: nurse?.phoneNumber,
            },
          },
        });

        if (error) {
          console.log(error);

          throw new Error(error.message);
        }

        if (!setupIntent?.paymentMethod) {
          throw new Error('No payment method returned from Stripe');
        }

        // Attach to customer — no DB write
        const pmId =
          typeof setupIntent.paymentMethod === 'string'
            ? setupIntent.paymentMethod
            : (setupIntent.paymentMethod as any)?.id;

        if (!pmId) {
          throw new Error('No payment method returned from Stripe');
        }

        await addPaymentMethod({
          nurseId,
          paymentMethodId: pmId,
          stripeCustomerId,
        });

        toast.success('Card saved successfully!');
        await onSuccess();
        onCloseModal();
      } catch (err: any) {
        toast.error('Failed to save card', {
          description: err?.message ?? 'Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    const cardComplete = details?.complete;
    const isDisabled = isLoading || !cardComplete;
    return (
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={ref}
          onChange={handleSheetChanges}
          backdropComponent={renderBackdrop}
          enableDynamicSizing={true}
          backgroundStyle={{ backgroundColor: theme.colors.background }}
          handleIndicatorStyle={{ backgroundColor: theme.colors.grey }}
          keyboardBehavior="extend"
        >
          <BottomSheetView style={styles.sheet}>
            <BottomSheetKeyboardAwareScrollView
              style={{ paddingBottom: bottom + 20 }}
            >
              <Text style={[styles.title, { color: theme.colors.typography }]}>
                Add Payment Card
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textGrey }]}>
                Your card will be used for commission billing when route sheets
                are approved.
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
                    backgroundColor: '#00000000', // '#00000000' is transparent in Android ARGB/RGBA format
                    textColor: '#000000', // Android requires 6 or 8 char hex codes
                    placeholderColor: theme.colors.textGrey,
                    borderColor: '#00000000',
                    cursorColor: '#000000',
                  }}
                  style={styles.cardField}
                  onCardChange={(details) => {
                    setDetails(details);
                  }}
                />
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={handleAdd}
                  disabled={isDisabled}
                  style={[
                    styles.primaryBtn,
                    {
                      backgroundColor: isDisabled
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
                  onPress={onCloseModal}
                  disabled={isLoading}
                  style={[styles.cancelBtn, { borderColor: theme.colors.grey }]}
                >
                  <Text
                    style={[
                      styles.cancelBtnText,
                      { color: theme.colors.textGrey },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  styles.secureNote,
                  { color: theme.colors.textGrey, marginBottom: bottom + 20 },
                ]}
              >
                🔒 Secured by Stripe — we never store your full card number.
              </Text>
            </BottomSheetKeyboardAwareScrollView>
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    );
  },
);

AddPaymentMethodModal.displayName = 'AddPaymentMethodModal';
const styles = StyleSheet.create(() => ({
  sheet: {
    padding: 24,
    gap: 14,
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
