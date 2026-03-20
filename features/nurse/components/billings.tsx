import { useNurse } from '@/components/context/nurse-context';
import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { Wrapper } from '@/features/shared/components/wrapper';
import { StripeProvider } from '@stripe/stripe-react-native';
import {
  IconArrowLeft,
  IconCreditCard,
  IconPlus,
  IconShieldCheck,
} from '@tabler/icons-react-native';
import { useAction, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { toast } from 'sonner-native';
import { AddPaymentMethodModal } from './add-payment-method';
import { PaymentMethodCard } from './payment-method-card';

const STRIPE_PK = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

export const Billings = () => {
  const { theme } = useUnistyles();
  const { nurse } = useNurse();
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [setupData, setSetupData] = useState<{
    clientSecret: string;
    customerId: string;
  } | null>(null);
  const [removingId, setRemovingId] =
    useState<Id<'nursePaymentMethods'> | null>(null);
  const [settingDefaultId, setSettingDefaultId] =
    useState<Id<'nursePaymentMethods'> | null>(null);

  // nurse is guaranteed non-null by NurseProvider + BillingScreen guard
  const nurseId = nurse!._id;

  const paymentMethods = useQuery(api.nursePayments.getPaymentMethods, {
    nurseId,
  });

  const createSetupIntent = useAction(
    api.nursePaymentsActions.createSetupIntentForNurse,
  );
  const removePaymentMethod = useAction(
    api.nursePaymentsActions.removePaymentMethod,
  );
  const setDefaultPaymentMethod = useAction(
    api.nursePaymentsActions.setDefaultPaymentMethod,
  );

  const handleOpenAddCard = useCallback(async () => {
    try {
      const data = await createSetupIntent({ nurseId });
      setSetupData(data);
      setShowAddModal(true);
    } catch (err: any) {
      toast.error('Could not initialise payment setup', {
        description: err?.message,
      });
    }
  }, [createSetupIntent, nurseId]);

  const handleRemove = useCallback(
    (paymentMethodId: Id<'nursePaymentMethods'>) => {
      Alert.alert(
        'Remove Card',
        'Are you sure you want to remove this payment method?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              setRemovingId(paymentMethodId);
              try {
                await removePaymentMethod({ paymentMethodId });
                toast.success('Card removed');
              } catch (err: any) {
                toast.error('Failed to remove card', {
                  description: err?.message,
                });
              } finally {
                setRemovingId(null);
              }
            },
          },
        ],
      );
    },
    [removePaymentMethod],
  );

  const handleSetDefault = useCallback(
    async (paymentMethodId: Id<'nursePaymentMethods'>) => {
      setSettingDefaultId(paymentMethodId);
      try {
        await setDefaultPaymentMethod({ paymentMethodId, nurseId });
        toast.success('Default card updated');
      } catch (err: any) {
        toast.error('Failed to update default', { description: err?.message });
      } finally {
        setSettingDefaultId(null);
      }
    },
    [setDefaultPaymentMethod, nurseId],
  );

  const handleModalClose = useCallback(() => {
    setShowAddModal(false);
    setSetupData(null);
  }, []);

  if (!nurse) return null;

  return (
    <StripeProvider publishableKey={STRIPE_PK}>
      <Wrapper>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backBtn,
              { backgroundColor: theme.colors.greyLight },
            ]}
            hitSlop={8}
          >
            <IconArrowLeft
              size={18}
              color={theme.colors.typography}
              strokeWidth={2.2}
            />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, { color: theme.colors.typography }]}
          >
            Billing & Payments
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.content}>
          {/* Info banner */}
          <View
            style={[
              styles.infoBanner,
              {
                backgroundColor: 'rgba(76,85,255,0.06)',
                borderColor: theme.colors.blue,
              },
            ]}
          >
            <View
              style={[
                styles.infoIconWrap,
                { backgroundColor: 'rgba(76,85,255,0.12)' },
              ]}
            >
              <IconShieldCheck size={18} color={theme.colors.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: theme.colors.blue }]}>
                How billing works
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textGrey }]}>
                When a hospice approves your route sheet, a commission fee is
                automatically charged from your default card.
              </Text>
            </View>
          </View>

          {/* Section label */}
          <Text style={[styles.sectionLabel, { color: theme.colors.textGrey }]}>
            Saved Cards
          </Text>

          {/* Card list */}
          {paymentMethods === undefined ? (
            <SmallLoader size={32} />
          ) : paymentMethods.length === 0 ? (
            <View
              style={[styles.emptyState, { borderColor: theme.colors.grey }]}
            >
              <View
                style={[
                  styles.emptyIconWrap,
                  { backgroundColor: theme.colors.greyLight },
                ]}
              >
                <IconCreditCard size={28} color={theme.colors.textGrey} />
              </View>
              <Text
                style={[styles.emptyTitle, { color: theme.colors.typography }]}
              >
                No cards saved
              </Text>
              <Text
                style={[styles.emptyText, { color: theme.colors.textGrey }]}
              >
                Add a payment card to enable automatic commission billing.
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
                  isRemoving={removingId === item._id}
                  isSettingDefault={settingDefaultId === item._id}
                />
              )}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Add Card CTA */}
        <View
          style={[
            styles.ctaContainer,
            {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.grey,
              paddingBottom: bottom + 16,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleOpenAddCard}
            style={[styles.addBtn, { backgroundColor: theme.colors.blue }]}
          >
            <IconPlus size={18} color="#fff" strokeWidth={2.5} />
            <Text style={styles.addBtnText}>Add Payment Card</Text>
          </TouchableOpacity>
        </View>

        {/* Add card modal */}
        {showAddModal && setupData && (
          <AddPaymentMethodModal
            visible={showAddModal}
            onClose={handleModalClose}
            nurseId={nurseId}
            clientSecret={setupData.clientSecret}
            stripeCustomerId={setupData.customerId}
            onSuccess={handleModalClose}
          />
        )}
      </Wrapper>
    </StripeProvider>
  );
};

const styles = StyleSheet.create(() => ({
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'PublicSansBold',
  },

  content: {
    flex: 1,
    gap: 16,
    paddingTop: 8,
  },

  infoBanner: {
    flexDirection: 'row' as const,
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'flex-start' as const,
  },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexShrink: 0,
    marginTop: 2,
  },
  infoTitle: {
    fontSize: 13,
    fontFamily: 'PublicSansBold',
    marginBottom: 3,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'PublicSansRegular',
    lineHeight: 17,
  },

  sectionLabel: {
    fontSize: 11,
    fontFamily: 'PublicSansBold',
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    marginBottom: -4,
  },

  list: {
    gap: 10,
  },

  emptyState: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'PublicSansBold',
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'PublicSansRegular',
    textAlign: 'center' as const,
    lineHeight: 18,
  },

  ctaContainer: {
    paddingBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  addBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'PublicSansBold',
  },
}));
