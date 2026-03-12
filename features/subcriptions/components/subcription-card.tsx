import { IconCheck } from '@tabler/icons-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type Props = {
  item: PurchasesPackage;
  isActive: boolean;
  onPress: () => void;
  price: string;
  hasFreeTrialOption: boolean;
  meta: {
    label: string;
    badge?: string | undefined;
    billingNote: string;
  };
};

export const SubscriptionCard = ({
  item,
  isActive,
  onPress,
  price,
  hasFreeTrialOption,
  meta,
}: Props) => {
  const { theme } = useUnistyles();
  return (
    <TouchableOpacity
      key={item.identifier}
      activeOpacity={0.85}
      onPress={() => onPress()}
      style={[
        styles.planCard,
        {
          borderColor: isActive ? theme.colors.blue : theme.colors.grey,
          backgroundColor: isActive
            ? 'rgba(76,85,255,0.06)'
            : theme.colors.background,
        },
      ]}
    >
      {/* Full-width badge at top */}
      {meta.badge && (
        <View style={[styles.badge, { backgroundColor: theme.colors.blue }]}>
          <Text style={styles.badgeText}>{meta.badge}</Text>
        </View>
      )}

      {/* Radio */}
      <View
        style={[
          styles.radio,
          {
            borderColor: isActive ? theme.colors.blue : theme.colors.grey,
            backgroundColor: isActive ? theme.colors.blue : 'transparent',
          },
        ]}
      >
        {isActive && <IconCheck size={10} color="#fff" strokeWidth={3} />}
      </View>

      {/* Label */}
      <Text
        style={[
          styles.planLabel,
          {
            color: isActive ? theme.colors.blue : theme.colors.black,
          },
        ]}
      >
        {meta.label}
      </Text>

      {/* Price */}
      <Text
        style={[
          styles.planPrice,
          {
            color: isActive ? theme.colors.blue : theme.colors.black,
          },
        ]}
      >
        {price}
      </Text>

      {/* Billing note */}
      <Text
        numberOfLines={2}
        style={[styles.planBillingNote, { color: theme.colors.textGrey }]}
      >
        {meta.billingNote}
        {hasFreeTrialOption ? '\n1 mo. free' : ''}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create((theme) => ({
  planCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 12,
    paddingTop: 28, // room for badge
    gap: 6,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  badge: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    alignItems: 'center' as const,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'PublicSansBold',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexShrink: 0,
  },
  planLabel: {
    fontSize: 14,
    fontFamily: 'PublicSansBold',
    marginTop: 4,
  },
  planBillingNote: {
    fontSize: 11,
    fontFamily: 'PublicSansRegular',
    marginTop: 2,
    lineHeight: 15,
  },
  planPrice: {
    fontSize: 10,
    fontFamily: 'PublicSansBold',
  },
}));
