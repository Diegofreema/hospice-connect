import { type Doc, type Id } from '@/convex/_generated/dataModel';
import { IconCheck, IconTrash } from '@tabler/icons-react-native';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type Props = {
  paymentMethod: Doc<'nursePaymentMethods'>;
  onRemove: (id: Id<'nursePaymentMethods'>) => void;
  onSetDefault: (id: Id<'nursePaymentMethods'>) => void;
  isRemoving?: boolean;
  isSettingDefault?: boolean;
};

const BRAND_LABELS: Record<string, string> = {
  visa: 'VISA',
  mastercard: 'MC',
  amex: 'AMEX',
  discover: 'DISC',
  jcb: 'JCB',
  unionpay: 'UP',
  diners: 'DINERS',
};

const BRAND_COLORS: Record<string, string> = {
  visa: '#1A1F71',
  mastercard: '#EB001B',
  amex: '#006FCF',
  discover: '#FF6600',
};

export const PaymentMethodCard = ({
  paymentMethod,
  onRemove,
  onSetDefault,
  isRemoving,
  isSettingDefault,
}: Props) => {
  const { theme } = useUnistyles();
  const { brand, last4, expMonth, expYear, isDefault, _id } = paymentMethod;

  const brandLabel = BRAND_LABELS[brand.toLowerCase()] ?? brand.toUpperCase();
  const brandColor = BRAND_COLORS[brand.toLowerCase()] ?? theme.colors.blue;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.background,
          borderColor: isDefault ? theme.colors.blue : theme.colors.grey,
          borderWidth: isDefault ? 1.5 : 1,
        },
      ]}
    >
      {/* Left: brand chip + card info */}
      <View style={styles.left}>
        <View style={[styles.brandChip, { backgroundColor: brandColor }]}>
          <Text style={styles.brandText}>{brandLabel}</Text>
        </View>
        <View>
          <Text style={[styles.cardNumber, { color: theme.colors.typography }]}>
            •••• •••• •••• {last4}
          </Text>
          <Text style={[styles.expiry, { color: theme.colors.textGrey }]}>
            Expires {String(expMonth).padStart(2, '0')}/{expYear}
          </Text>
        </View>
      </View>

      {/* Right: default badge + actions */}
      <View style={styles.right}>
        {isDefault ? (
          <View
            style={[
              styles.defaultBadge,
              { backgroundColor: 'rgba(76,85,255,0.10)' },
            ]}
          >
            <IconCheck size={11} color={theme.colors.blue} strokeWidth={3} />
            <Text style={[styles.defaultText, { color: theme.colors.blue }]}>
              Default
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => onSetDefault(_id)}
            disabled={isSettingDefault}
            style={[styles.setDefaultBtn, { borderColor: theme.colors.grey }]}
          >
            {isSettingDefault ? (
              <ActivityIndicator size="small" color={theme.colors.blue} />
            ) : (
              <Text
                style={[styles.setDefaultText, { color: theme.colors.blue }]}
              >
                Set Default
              </Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => onRemove(_id)}
          disabled={isRemoving}
          style={[
            styles.removeBtn,
            { backgroundColor: 'rgba(246,58,58,0.10)' },
          ]}
        >
          {isRemoving ? (
            <ActivityIndicator size="small" color={theme.colors.redDark} />
          ) : (
            <IconTrash size={15} color={theme.colors.redDark} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  card: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  left: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 1,
  },
  brandChip: {
    width: 44,
    height: 28,
    borderRadius: 6,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexShrink: 0,
  },
  brandText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'PublicSansBold',
    letterSpacing: 0.5,
  },
  cardNumber: {
    fontSize: 14,
    fontFamily: 'PublicSansSemiBold',
    letterSpacing: 0.5,
  },
  expiry: {
    fontSize: 12,
    fontFamily: 'PublicSansRegular',
    marginTop: 2,
  },
  right: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  defaultBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  defaultText: {
    fontSize: 11,
    fontFamily: 'PublicSansBold',
  },
  setDefaultBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center' as const,
  },
  setDefaultText: {
    fontSize: 11,
    fontFamily: 'PublicSansSemiBold',
  },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
}));
