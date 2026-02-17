import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
// import { CardField, useStripe } from '@stripe/stripe-react-native';
import { useAction } from 'convex/react';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { toast } from 'sonner-native';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  nurseId: Id<'nurses'>;
};

export const AddPaymentMethodModal = ({ isOpen, onClose, nurseId }: Props) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  // const { createPaymentMethod } = useStripe();
  const addPaymentMethod = useAction(api.nursePayments.addPaymentMethod);

  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);

  React.useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isOpen]);

  const handleAddCard = async () => {
    if (!cardDetails?.complete) {
      toast.error('Invalid card details', {
        description: 'Please enter complete card information',
      });
      return;
    }

    setLoading(true);
    try {
      // Create payment method with Stripe
      // const { paymentMethod, error } = await createPaymentMethod({
      //   paymentMethodType: 'Card',
      // });

      // if (error) {
      //   throw new Error(error.message);
      // }

      // if (!paymentMethod) {
      //   throw new Error('Failed to create payment method');
      // }

      // // Add payment method to backend
      // await addPaymentMethod({
      //   nurseId,
      //   paymentMethodId: paymentMethod.id,
      // });

      toast.success('Card added successfully');
      onClose();
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to add card', {
        description: error.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['50%']}
      onDismiss={onClose}
      enablePanDownToClose
    >
      <BottomSheetView className="flex-1 px-4 py-6">
        <Text className="mb-4 text-xl font-bold">Add Payment Method</Text>

        <View className="mb-6">
          {/* <CardField
            postalCodeEnabled={false}
            placeholders={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={{
              backgroundColor: '#FFFFFF',
              textColor: '#000000',
            }}
            style={{
              width: '100%',
              height: 50,
              marginVertical: 10,
            }}
            onCardChange={(details) => {
              setCardDetails(details);
            }}
          /> */}
        </View>

        <View className="gap-3">
          <Pressable
            onPress={handleAddCard}
            disabled={loading || !cardDetails?.complete}
            className={`rounded-lg py-4 ${
              loading || !cardDetails?.complete ? 'bg-gray-300' : 'bg-blue-500'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center font-semibold text-white">
                Add Card
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 py-4"
          >
            <Text className="text-center font-semibold text-gray-700">
              Cancel
            </Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};
