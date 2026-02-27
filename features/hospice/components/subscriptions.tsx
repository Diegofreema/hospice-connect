import { ErrorComponent } from '@/features/shared/components/error';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { useCancelSubscription } from '@/hooks/rc/use-cancel-subscription';
import { useGetCustomerRC } from '@/hooks/rc/use-get-customer-rc';
import { useGetOfferings } from '@/hooks/rc/use-get-offerings';
import {
  IconCalendar,
  IconChevronRight,
  IconClipboardHeart,
  IconDiamond,
  IconRefresh,
  IconShieldCheck,
  IconUsers,
  IconX,
} from '@tabler/icons-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { toast } from 'sonner-native';

const PLAN_META: Record<
  string,
  {
    label: string;
    badge?: string;
    billingNote: string;
    icon: typeof IconCalendar;
  }
> = {
  $rc_monthly: {
    label: 'Monthly',
    billingNote: 'Billed monthly',
    icon: IconCalendar,
  },
  $rc_three_month: {
    label: 'Quarterly',
    badge: 'Save 10%',
    billingNote: 'Billed every 3 months',
    icon: IconUsers,
  },
  $rc_annual: {
    label: 'Annual',
    badge: 'Best Value',
    billingNote: 'Billed once a year',
    icon: IconDiamond,
  },
};

const SORT_ORDER: Record<string, number> = {
  $rc_monthly: 0,
  $rc_three_month: 1,
  $rc_annual: 2,
};

const ENTITLEMENT_KEY = 'pro';

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const Subscriptions = () => {
  const { theme } = useUnistyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const {
    data: customerInfo,
    isPending: customerPending,
    isError: customerError,
    refetch: refetchCustomer,
  } = useGetCustomerRC();

  const {
    data: offerings,
    isPending: offeringsPending,
    isError: offeringsError,
    refetch: refetchOfferings,
  } = useGetOfferings();

  const { openManagementURL, isLoading: cancelLoading } =
    useCancelSubscription();

  const isLoading = customerPending || offeringsPending;
  const isError = customerError || offeringsError;

  if (isLoading) return <SmallLoader size={50} />;
  if (isError)
    return (
      <ErrorComponent
        refetch={() => {
          refetchCustomer();
          refetchOfferings();
        }}
        text="Could not load subscription data"
      />
    );

  // ── Subscription state ──────────────────────────────────────────
  const activeEntitlement =
    customerInfo?.entitlements?.active?.[ENTITLEMENT_KEY];
  const isSubscribed = !!activeEntitlement;
  const expiresAt = activeEntitlement?.expirationDate
    ? new Date(activeEntitlement.expirationDate).getTime()
    : null;
  const willRenew = activeEntitlement?.willRenew ?? false;
  const productId = activeEntitlement?.productIdentifier ?? null;
  const currentPlanMeta = productId ? (PLAN_META[productId] ?? null) : null;

  // ── Packages ────────────────────────────────────────────────────
  const offering =
    offerings?.all?.['hospice_pro'] ?? offerings?.current ?? null;
  const packages: PurchasesPackage[] = offering?.availablePackages ?? [];
  const sorted = [...packages].sort(
    (a, b) =>
      (SORT_ORDER[a.identifier] ?? 99) - (SORT_ORDER[b.identifier] ?? 99),
  );

  // Pre-select the current plan if subscribed, otherwise default to first
  const defaultSelection = productId ?? sorted[0]?.identifier ?? null;
  const activeId = selectedId ?? defaultSelection;
  const activePackage = sorted.find((p) => p.identifier === activeId) ?? null;

  const isChangingPlan = isSubscribed && activeId !== productId;

  // ── Actions ─────────────────────────────────────────────────────
  const handlePurchase = async () => {
    if (!activePackage) {
      Alert.alert('No plan selected', 'Please select a subscription plan.');
      return;
    }
    if (isSubscribed && !isChangingPlan) {
      toast('You are already on this plan.');
      return;
    }
    setIsPurchasing(true);
    try {
      const { customerInfo: updated } =
        await Purchases.purchasePackage(activePackage);
      if (Object.keys(updated.entitlements.active).length > 0) {
        toast.success(
          isChangingPlan ? 'Plan updated!' : 'Subscription activated!',
          {
            description: isChangingPlan
              ? 'Your plan has been switched successfully.'
              : 'Welcome to Hospice Connect Pro.',
          },
        );
        refetchCustomer();
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

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await Purchases.restorePurchases();
      await refetchCustomer();
      toast.success('Purchases restored successfully.');
    } catch {
      toast.error('Restore failed', { description: 'Please try again.' });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleOpenLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const handleCancelOrManage = () => {
    Alert.alert(
      'Manage Subscription',
      isSubscribed
        ? 'You can cancel or modify your subscription from your store account. Would you like to open the management page?'
        : "You don't have an active subscription.",
      isSubscribed
        ? [
            { text: 'Not Now', style: 'cancel' },
            {
              text: 'Open',
              onPress: openManagementURL,
            },
          ]
        : [{ text: 'OK' }],
    );
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Current Status Banner ── */}
        <View
          style={[
            styles.statusBanner,
            {
              backgroundColor: isSubscribed
                ? 'rgba(76,85,255,0.08)'
                : 'rgba(255,159,45,0.08)',
              borderColor: isSubscribed
                ? theme.colors.blue
                : theme.colors.orange,
            },
          ]}
        >
          <View style={styles.statusHeader}>
            <View
              style={[
                styles.statusIconWrap,
                {
                  backgroundColor: isSubscribed
                    ? 'rgba(76,85,255,0.14)'
                    : 'rgba(255,159,45,0.14)',
                },
              ]}
            >
              <IconDiamond
                size={22}
                color={isSubscribed ? theme.colors.blue : theme.colors.orange}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.statusTitle,
                  {
                    color: isSubscribed
                      ? theme.colors.blue
                      : theme.colors.orange,
                  },
                ]}
              >
                {isSubscribed ? 'Pro Subscriber' : 'Free Plan'}
              </Text>
              <Text
                style={[
                  styles.statusSubtitle,
                  { color: theme.colors.textGrey },
                ]}
              >
                {isSubscribed
                  ? (currentPlanMeta?.label ?? 'Active') + ' Plan'
                  : 'Upgrade to unlock all features'}
              </Text>
            </View>
            {isSubscribed && (
              <View
                style={[
                  styles.activeBadge,
                  { backgroundColor: theme.colors.greenDark },
                ]}
              >
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            )}
          </View>

          {isSubscribed && (
            <View
              style={[
                styles.billingInfo,
                { borderTopColor: 'rgba(76,85,255,0.12)' },
              ]}
            >
              <BillingRow
                label="Billing Cycle"
                value={currentPlanMeta?.billingNote ?? '—'}
                theme={theme}
              />
              {expiresAt && (
                <BillingRow
                  label={willRenew ? 'Renews On' : 'Expires On'}
                  value={formatDate(expiresAt)}
                  theme={theme}
                  highlight={!willRenew}
                />
              )}
              <BillingRow
                label="Auto-Renew"
                value={willRenew ? 'Enabled' : 'Disabled'}
                theme={theme}
                highlight={!willRenew}
              />
            </View>
          )}
        </View>

        {/* ── What's included ── */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.grey,
            },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: theme.colors.typography }]}
          >
            What&apos;s Included
          </Text>
          {[
            {
              icon: IconShieldCheck,
              text: 'Post and manage patient assignments with ease',
            },
            {
              icon: IconUsers,
              text: 'Access a network of verified healthcare professionals',
            },
            {
              icon: IconClipboardHeart,
              text: 'Priority support and advanced scheduling tools',
            },
          ].map(({ icon: Icon, text }, i) => (
            <View key={i} style={styles.featureRow}>
              <View
                style={[
                  styles.featureIconWrap,
                  { backgroundColor: 'rgba(76,85,255,0.10)' },
                ]}
              >
                <Icon size={16} color={theme.colors.blue} />
              </View>
              <Text
                style={[styles.featureText, { color: theme.colors.typography }]}
              >
                {text}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Plan chooser ── */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textGrey }]}>
          {isSubscribed ? 'Switch Plan' : 'Choose a Plan'}
        </Text>

        {sorted.length === 0 ? (
          <View style={[styles.noPlanBox, { borderColor: theme.colors.grey }]}>
            <Text
              style={{
                color: theme.colors.textGrey,
                textAlign: 'center',
                fontFamily: 'PublicSansRegular',
                fontSize: 14,
              }}
            >
              No subscription plans available at the moment.
            </Text>
          </View>
        ) : (
          <View style={styles.plansRow}>
            {sorted.map((pkg) => {
              const isActive = pkg.identifier === activeId;
              const isCurrent = pkg.identifier === productId;
              const meta = PLAN_META[pkg.identifier] ?? {
                label: pkg.identifier,
                billingNote: '',
                icon: IconCalendar,
              };
              const PlanIcon = meta.icon;
              const price = pkg.product.priceString;

              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  activeOpacity={0.82}
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
                  {isCurrent && isSubscribed && (
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: meta.badge
                            ? theme.colors.greenDark
                            : theme.colors.greenDark,
                          top: meta.badge ? undefined : 0,
                        },
                      ]}
                    >
                      <Text style={styles.badgeText}>Current</Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.planIconWrap,
                      {
                        backgroundColor: isActive
                          ? 'rgba(76,85,255,0.14)'
                          : theme.colors.greyLight,
                      },
                    ]}
                  >
                    <PlanIcon
                      size={18}
                      color={
                        isActive ? theme.colors.blue : theme.colors.textGrey
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.planLabel,
                      {
                        color: isActive
                          ? theme.colors.blue
                          : theme.colors.typography,
                        marginTop: 8,
                      },
                    ]}
                  >
                    {meta.label}
                  </Text>

                  <Text
                    style={[
                      styles.planPrice,
                      {
                        color: isActive
                          ? theme.colors.blue
                          : theme.colors.typography,
                      },
                    ]}
                  >
                    {price}
                  </Text>

                  <Text
                    numberOfLines={2}
                    style={[
                      styles.planBillingNote,
                      { color: theme.colors.textGrey },
                    ]}
                  >
                    {meta.billingNote}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── Quick Actions ── */}
        {isSubscribed && (
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.grey,
                gap: 0,
              },
            ]}
          >
            <Text
              style={[styles.sectionTitle, { color: theme.colors.typography }]}
            >
              Manage Subscription
            </Text>
            <ActionRow
              icon={IconX}
              label="Manage / Cancel Subscription"
              sublabel="Opens your store's subscription settings"
              onPress={handleCancelOrManage}
              isLoading={cancelLoading}
              theme={theme}
              iconColor={theme.colors.redDark}
            />
            <View
              style={[styles.divider, { backgroundColor: theme.colors.grey }]}
            />
            <ActionRow
              icon={IconRefresh}
              label="Restore Purchases"
              sublabel="Already subscribed? Restore your access"
              onPress={handleRestore}
              isLoading={isRestoring}
              theme={theme}
              iconColor={theme.colors.blue}
            />
          </View>
        )}

        {/* ── Footer ── */}
        <View style={styles.footerLinks}>
          <TouchableOpacity
            onPress={() =>
              handleOpenLink('https://hospice-connect-web.vercel.app/terms')
            }
          >
            <Text style={[styles.footerLink, { color: theme.colors.textGrey }]}>
              Terms of Use
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
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        {!isSubscribed && (
          <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
            <Text style={[styles.footerLink, { color: theme.colors.textGrey }]}>
              Restore Purchases
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* ── Sticky CTA ── */}
      {sorted.length > 0 && (
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
            disabled={
              isPurchasing ||
              sorted.length === 0 ||
              (isSubscribed && !isChangingPlan)
            }
            style={[
              styles.ctaButton,
              {
                backgroundColor:
                  isSubscribed && !isChangingPlan
                    ? theme.colors.greyLight
                    : theme.colors.blue,
                opacity:
                  isPurchasing ||
                  sorted.length === 0 ||
                  (isSubscribed && !isChangingPlan)
                    ? 0.65
                    : 1,
              },
            ]}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[
                  styles.ctaText,
                  {
                    color:
                      isSubscribed && !isChangingPlan
                        ? theme.colors.textGrey
                        : '#fff',
                  },
                ]}
              >
                {isSubscribed && !isChangingPlan
                  ? 'Current Plan'
                  : isChangingPlan
                    ? `Switch to ${PLAN_META[activeId ?? '']?.label ?? 'this'} Plan`
                    : activePackage
                      ? `Subscribe · ${activePackage.product.priceString}`
                      : 'Subscribe'}
              </Text>
            )}
          </TouchableOpacity>
          {Platform.OS === 'android' && (
            <Text
              style={[styles.platformNote, { color: theme.colors.textGrey }]}
            >
              Subscription managed through Google Play
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

// ── Sub-components ────────────────────────────────────────────────

const BillingRow = ({
  label,
  value,
  theme,
  highlight,
}: {
  label: string;
  value: string;
  theme: any;
  highlight?: boolean;
}) => (
  <View style={styles.billingRow}>
    <Text style={[styles.billingLabel, { color: theme.colors.textGrey }]}>
      {label}
    </Text>
    <Text
      style={[
        styles.billingValue,
        { color: highlight ? theme.colors.orange : theme.colors.typography },
      ]}
    >
      {value}
    </Text>
  </View>
);

const ActionRow = ({
  icon: Icon,
  label,
  sublabel,
  onPress,
  isLoading,
  theme,
  iconColor,
}: {
  icon: typeof IconX;
  label: string;
  sublabel: string;
  onPress: () => void;
  isLoading?: boolean;
  theme: any;
  iconColor?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={isLoading}
    activeOpacity={0.75}
    style={styles.actionRow}
  >
    <View
      style={[
        styles.actionIconWrap,
        {
          backgroundColor: iconColor
            ? `${iconColor}18`
            : theme.colors.greyLight,
        },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={iconColor ?? theme.colors.blue}
        />
      ) : (
        <Icon size={17} color={iconColor ?? theme.colors.blue} />
      )}
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.actionLabel, { color: theme.colors.typography }]}>
        {label}
      </Text>
      <Text style={[styles.actionSublabel, { color: theme.colors.textGrey }]}>
        {sublabel}
      </Text>
    </View>
    <IconChevronRight size={15} color={theme.colors.textGrey} />
  </TouchableOpacity>
);

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create(() => ({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 130,
    gap: 16,
  },

  // Status banner
  statusBanner: {
    borderWidth: 1.5,
    borderRadius: 18,
    overflow: 'hidden' as const,
  },
  statusHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    padding: 16,
  },
  statusIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexShrink: 0,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'PublicSansBold',
    lineHeight: 20,
  },
  statusSubtitle: {
    fontSize: 13,
    fontFamily: 'PublicSansRegular',
    marginTop: 2,
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'PublicSansBold',
  },
  billingInfo: {
    borderTopWidth: 1,
    marginHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  billingRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  billingLabel: {
    fontSize: 13,
    fontFamily: 'PublicSansRegular',
  },
  billingValue: {
    fontSize: 13,
    fontFamily: 'PublicSansSemiBold',
  },

  // Section card
  section: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'PublicSansBold',
    marginBottom: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'PublicSansBold',
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    marginBottom: -4,
  },

  // Features
  featureRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
  },
  featureIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'PublicSansRegular',
    lineHeight: 20,
    paddingTop: 5,
  },

  // Plans
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
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 14,
    paddingTop: 30,
    gap: 4,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    alignItems: 'center' as const,
  },
  planIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  badge: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    alignItems: 'center' as const,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'PublicSansBold',
    letterSpacing: 0.3,
  },
  planLabel: {
    fontSize: 13,
    fontFamily: 'PublicSansBold',
    textAlign: 'center' as const,
  },
  planPrice: {
    fontSize: 16,
    fontFamily: 'PublicSansBold',
    textAlign: 'center' as const,
  },
  planBillingNote: {
    fontSize: 10,
    fontFamily: 'PublicSansRegular',
    lineHeight: 14,
    textAlign: 'center' as const,
    marginTop: 2,
  },

  // Action rows
  actionRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    paddingVertical: 12,
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexShrink: 0,
  },
  actionLabel: {
    fontSize: 14,
    fontFamily: 'PublicSansSemiBold',
    lineHeight: 18,
  },
  actionSublabel: {
    fontSize: 12,
    fontFamily: 'PublicSansRegular',
    marginTop: 2,
  },
  divider: {
    height: 1,
    borderRadius: 1,
  },

  // Footer
  footerLinks: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
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
  restoreBtn: {
    alignItems: 'center' as const,
    marginTop: -8,
  },

  // CTA
  ctaContainer: {
    position: 'absolute' as const,
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
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  ctaText: {
    fontSize: 16,
    fontFamily: 'PublicSansBold',
  },
  platformNote: {
    fontSize: 11,
    fontFamily: 'PublicSansRegular',
    textAlign: 'center' as const,
    marginTop: 8,
  },
}));
