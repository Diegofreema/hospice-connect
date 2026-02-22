import { ErrorComponent } from '@/features/shared/components/error';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { useGetOfferings } from '@/hooks/rc/use-get-offerings';
import {
  IconCheck,
  IconClipboardHeart,
  IconUsers,
} from '@tabler/icons-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { toast } from 'sonner-native';
const FEATURES = [
  {
    icon: IconClipboardHeart,
    text: 'Post and manage patient assignments with ease.',
  },
  {
    icon: IconUsers,
    text: 'Access a network of verified healthcare professionals in your area.',
  },
];

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

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

  const handleOpenLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Hero ── */}
        <View style={styles.heroBanner}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.heroLogo}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>Hospice Connect Pro</Text>
          <Text style={styles.heroSubtitle}>
            Unlock full access to the platform and start managing your care team
            today.
          </Text>
        </View>

        {/* ── Features ── */}
        <View
          style={[
            styles.featuresCard,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.grey,
            },
          ]}
        >
          {FEATURES.map(({ icon: Icon, text }, i) => (
            <View key={i} style={styles.featureRow}>
              <View
                style={[
                  styles.featureIconWrap,
                  { backgroundColor: 'rgba(76,85,255,0.10)' },
                ]}
              >
                <Icon size={18} color={theme.colors.blue} />
              </View>
              <Text style={[styles.featureText, { color: theme.colors.black }]}>
                {text}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Plan label ── */}
        <Text
          style={[styles.choosePlanLabel, { color: theme.colors.textGrey }]}
        >
          Choose your plan
        </Text>

        {/* ── Plan cards ── */}
        {sorted.length === 0 ? (
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
        ) : (
          <View style={styles.plansRow}>
            {sorted.map((pkg) => {
              const isActive = pkg.identifier === activeId;
              const meta = PLAN_META[pkg.identifier] ?? {
                label: pkg.identifier,
                billingNote: '',
              };
              const price = pkg.product.priceString;
              const hasFreeTrialOption = (
                pkg.product.subscriptionOptions ?? []
              ).some((opt: any) => opt.freePhase !== null);

              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  activeOpacity={0.85}
                  onPress={() => setSelectedId(pkg.identifier)}
                  style={[
                    styles.planCard,
                    {
                      borderColor: isActive
                        ? theme.colors.blue
                        : theme.colors.grey,
                      backgroundColor: isActive
                        ? 'rgba(76,85,255,0.06)'
                        : theme.colors.background,
                    },
                  ]}
                >
                  {/* Full-width badge at top */}
                  {meta.badge && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: theme.colors.blue },
                      ]}
                    >
                      <Text style={styles.badgeText}>{meta.badge}</Text>
                    </View>
                  )}

                  {/* Radio */}
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: isActive
                          ? theme.colors.blue
                          : theme.colors.grey,
                        backgroundColor: isActive
                          ? theme.colors.blue
                          : 'transparent',
                      },
                    ]}
                  >
                    {isActive && (
                      <IconCheck size={10} color="#fff" strokeWidth={3} />
                    )}
                  </View>

                  {/* Label */}
                  <Text
                    style={[
                      styles.planLabel,
                      {
                        color: isActive
                          ? theme.colors.blue
                          : theme.colors.black,
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
                        color: isActive
                          ? theme.colors.blue
                          : theme.colors.black,
                      },
                    ]}
                  >
                    {price}
                  </Text>

                  {/* Billing note */}
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.planBillingNote,
                      { color: theme.colors.textGrey },
                    ]}
                  >
                    {meta.billingNote}
                    {hasFreeTrialOption ? '\n1 mo. free' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── Footer links ── */}
        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => Purchases.restorePurchases()}>
            <Text style={[styles.footerLink, { color: theme.colors.textGrey }]}>
              Restore Purchases
            </Text>
          </TouchableOpacity>
          <Text style={[styles.footerDot, { color: theme.colors.textGrey }]}>
            ·
          </Text>
          <TouchableOpacity
            onPress={() =>
              handleOpenLink('https://hospice-connect-web.vercel.app/terms')
            }
          >
            <Text style={[styles.footerLink, { color: theme.colors.textGrey }]}>
              Terms
            </Text>
          </TouchableOpacity>
          <Text style={[styles.footerDot, { color: theme.colors.textGrey }]}>
            ·
          </Text>
          <TouchableOpacity
            onPress={() =>
              handleOpenLink('https://hospice-connect-web.vercel.app/privacy')
            }
          >
            <Text style={[styles.footerLink, { color: theme.colors.textGrey }]}>
              Privacy
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Sticky CTA ── */}
      <View
        style={[
          styles.ctaContainer,
          {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.grey,
          },
        ]}
      >
        <TouchableOpacity
          onPress={handlePurchase}
          disabled={isPurchasing || sorted.length === 0}
          style={[
            styles.ctaButton,
            {
              backgroundColor: theme.colors.blue,
              opacity: isPurchasing || sorted.length === 0 ? 0.6 : 1,
            },
          ]}
        >
          {isPurchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaText}>
              {activePackage
                ? `Subscribe · ${activePackage.product.priceString}`
                : 'Subscribe'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 16,
  },

  // Hero
  heroBanner: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#4C55FF',
  },
  heroLogo: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: 'PublicSansBold',
    color: '#fff',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'PublicSansRegular',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Features
  featuresCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'PublicSansRegular',
    lineHeight: 20,
    paddingTop: 7,
  },

  // Plans
  choosePlanLabel: {
    fontSize: 11,
    fontFamily: 'PublicSansBold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: -4,
  },
  noPlanBox: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center' as const,
  },
  plansRow: {
    flexDirection: 'row' as const,
    gap: 10,
  },
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

  // Footer
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  footerLink: {
    fontSize: 13,
    fontFamily: 'PublicSansRegular',
  },
  footerDot: {
    fontSize: 13,
  },

  // CTA
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  ctaButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PublicSansBold',
  },
}));
