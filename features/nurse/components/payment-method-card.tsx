import { type Doc, type Id } from '@/convex/_generated/dataModel';
import { Trash2 } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  paymentMethod: Doc<'nursePaymentMethods'>;
  onRemove: (id: Id<'nursePaymentMethods'>) => void;
  onSetDefault: (id: Id<'nursePaymentMethods'>) => void;
};

const getCardIcon = (brand: string) => {
  switch (brand.toLowerCase()) {
    case 'visa':
      return '💳';
    case 'mastercard':
      return '💳';
    case 'amex':
      return '💳';
    case 'discover':
      return '💳';
    default:
      return '💳';
  }
};

export const PaymentMethodCard = ({
  paymentMethod,
  onRemove,
  onSetDefault,
}: Props) => {
  const { brand, last4, expMonth, expYear, isDefault, _id } = paymentMethod;

  return (
    <View className="flex-row items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
      <View className="flex-1 flex-row items-center gap-3">
        <Text className="text-3xl">{getCardIcon(brand)}</Text>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold capitalize">{brand}</Text>
            {isDefault && (
              <View className="rounded-full bg-green-100 px-2 py-1">
                <Text className="text-xs font-medium text-green-700">
                  Default
                </Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-gray-600">•••• •••• •••• {last4}</Text>
          <Text className="text-xs text-gray-500">
            Expires {expMonth.toString().padStart(2, '0')}/{expYear}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        {!isDefault && (
          <Pressable
            onPress={() => onSetDefault(_id)}
            className="rounded-md bg-blue-500 px-3 py-2"
          >
            <Text className="text-xs font-medium text-white">Set Default</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => onRemove(_id)}
          className="rounded-md bg-red-500 p-2"
        >
          <Trash2 color="white" size={16} />
        </Pressable>
      </View>
    </View>
  );
};
