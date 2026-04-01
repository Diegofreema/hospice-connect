import { useHospice } from '@/components/context/hospice-context';
import { ErrorComponent } from '@/features/shared/components/error';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { setRCAttributes } from '@/features/shared/utils';
import { SubscriptionCard } from '@/features/subcriptions/components/subcription-card';
import { SubscriptionFooter } from '@/features/subcriptions/components/subcription-footer';
import { SubscriptionHeader } from '@/features/subcriptions/components/subscription-header';
import { useGetOfferings } from '@/hooks/rc/use-get-offerings';

import { useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { toast } from 'sonner-native';

const PLAN_META: Record<
  string,
  { label: string; badge?: string; billingNote: string }
> = {
  $rc_monthly: {
    label: 'Monthly',
    billingNote: 'Billed monthly',
  },
  $rc_three_month: {
    label: 'Quarterly',
    badge: 'Save 10%',
    billingNote: 'Billed every 3 months',
  },
  $rc_annual: {
    label: 'Annually',
    badge: 'Best Value',
    billingNote: 'Billed once per year',
  },
};

const SORT_ORDER: Record<string, number> = {
  $rc_monthly: 0,
  $rc_three_month: 1,
  $rc_annual: 2,
};

export const Paywall = () => {
  const { theme } = useUnistyles();
  const { hospice } = useHospice();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { bottom } = useSafeAreaInsets();
  const { data: offerings, isPending, isError, refetch } = useGetOfferings();

  if (isPending) {
    return <SmallLoader size={50} />;
  }
  if (isError) {
    return <ErrorComponent refetch={refetch} text="Something went wrong" />;
  }

  const offering =
    offerings?.all?.['hospice_pro'] ?? offerings?.current ?? null;
  const packages: PurchasesPackage[] = offering
    ? (offering.availablePackages ?? [])
    : [];

  const sorted = [...packages].sort(
    (a, b) =>
      (SORT_ORDER[a.identifier] ?? 99) - (SORT_ORDER[b.identifier] ?? 99),
  );

  const activeId = selectedId ?? sorted[0]?.identifier ?? null;
  const activePackage = sorted.find((p) => p.identifier === activeId) ?? null;

  const handlePurchase = async () => {
    if (!hospice?.businessName) {
      return;
    }
    if (!activePackage) {
      Alert.alert('No plan selected', 'Please select a subscription plan.');
      return;
    }
    setIsPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(activePackage);
      if (Object.keys(customerInfo.entitlements.active).length > 0) {
        toast.success('Subscription activated!', {
          description: 'Welcome to Hospice Connect Pro.',
        });
      }
      await setRCAttributes(hospice.businessName);
    } catch (err: any) {
      if (!err.userCancelled) {
        toast.error('Purchase failed', {
          description: err?.message ?? 'Please try again.',
        });
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <FlatList
      numColumns={3}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        gap: 20,
        flexGrow: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: 15,
        paddingBottom: bottom + 20,
      }}
      columnWrapperStyle={{
        gap: 10,
      }}
      ListHeaderComponent={<SubscriptionHeader />}
      data={sorted}
      ListEmptyComponent={
        <View style={[styles.noPlanBox, { borderColor: theme.colors.grey }]}>
          <Text
            style={{
              color: theme.colors.textGrey,
              textAlign: 'center',
              fontFamily: 'PublicSansRegular',
            }}
          >
            No subscription plans available at the moment.
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const isActive = item.identifier === activeId;
        const meta = PLAN_META[item.identifier] ?? {
          label: item.identifier,
          billingNote: '',
        };
        const price = item.product.priceString;
        const hasFreeTrialOption = (
          item.product.subscriptionOptions ?? []
        ).some((opt: any) => opt.freePhase !== null);

        return (
          <SubscriptionCard
            key={item.identifier}
            item={item}
            isActive={isActive}
            onPress={() => setSelectedId(item.identifier)}
            price={price}
            hasFreeTrialOption={hasFreeTrialOption}
            meta={meta}
          />
        );
      }}
      ListFooterComponent={
        <SubscriptionFooter
          handlePurchase={handlePurchase}
          isPurchasing={isPurchasing}
          activePackage={activePackage}
          sorted={sorted}
        />
      }
      ListFooterComponentStyle={{
        marginTop: 'auto',
      }}
    />
  );
};

const styles = StyleSheet.create(() => ({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 16,
    flexGrow: 1,
  },

  noPlanBox: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center' as const,
  },
}));
