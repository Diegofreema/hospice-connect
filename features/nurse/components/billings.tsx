/* eslint-disable prettier/prettier */

import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
// import { StripeProvider } from '@stripe/stripe-react-native';
import { useAction, useQuery } from 'convex/react';
import { Plus } from 'lucide-react-native';
import { JSX, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { toast } from 'sonner-native';
import { AddPaymentMethodModal } from './add-payment-method';
import { PaymentMethodCard } from './payment-method-card';

type Props = {
  nurseId: Id<'nurses'>;
};

// TODO: Replace with your actual Stripe publishable key
const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

export const Billings = ({ nurseId }: Props): JSX.Element => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const paymentMethods = useQuery(api.nursePayments.getPaymentMethods, {
    nurseId,
  });
  const removePaymentMethod = useAction(api.nursePayments.removePaymentMethod);
  const setDefaultPaymentMethod = useAction(
    api.nursePayments.setDefaultPaymentMethod,
  );

  const handleRemove = (paymentMethodId: Id<'nursePaymentMethods'>) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removePaymentMethod({ paymentMethodId });
              toast.success('Payment method removed');
            } catch (error: any) {
              toast.error('Failed to remove payment method', {
                description: error.message,
              });
            }
          },
        },
      ],
    );
  };

  const handleSetDefault = async (
    paymentMethodId: Id<'nursePaymentMethods'>,
  ) => {
    try {
      await setDefaultPaymentMethod({ paymentMethodId, nurseId });
      toast.success('Default payment method updated');
    } catch (error: any) {
      toast.error('Failed to set default', {
        description: error.message,
      });
    }
  };

  return (
    // <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
    <Wrapper>
      <BackButton marginTop={0} title="Billing & Payment Methods" />

      <View className="mt-6 flex-1">
        {/* Add Payment Method Button */}
        <Pressable
          onPress={() => setIsAddModalOpen(true)}
          className="mb-6 flex-row items-center justify-center gap-2 rounded-lg bg-blue-500 py-4"
        >
          <Plus color="white" size={20} />
          <Text className="font-semibold text-white">Add Payment Method</Text>
        </Pressable>

        {/* Payment Methods List */}
        {paymentMethods === undefined ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : paymentMethods.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-gray-500">
              No payment methods added yet
            </Text>
            <Text className="mt-2 text-center text-sm text-gray-400">
              Add a payment method to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={paymentMethods}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <PaymentMethodCard
                paymentMethod={item}
                onRemove={handleRemove}
                onSetDefault={handleSetDefault}
              />
            )}
            contentContainerStyle={{ gap: 12 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <AddPaymentMethodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        nurseId={nurseId}
      />
    </Wrapper>
    // </StripeProvider>
  );
};
