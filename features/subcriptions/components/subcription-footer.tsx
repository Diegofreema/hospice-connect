import * as WebBrowser from 'expo-web-browser';

import { authClient } from '@/lib/auth-client';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type Props = {
  handlePurchase: () => void;
  isPurchasing: boolean;
  activePackage: PurchasesPackage | null;
  sorted: PurchasesPackage[];
};

export const SubscriptionFooter = ({
  handlePurchase,
  isPurchasing,
  activePackage,
  sorted,
}: Props) => {
  const { theme } = useUnistyles();

  const handleOpenLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };
  return (
    <View style={{ gap: 15 }}>
      <View style={styles.footerLinks}>
        {/* <TouchableOpacity onPress={() => Purchases.restorePurchases()}>
          <Text style={[styles.footerLink, { color: theme.colors.textGrey }]}>
            Restore Purchases
          </Text>
        </TouchableOpacity> */}
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
        <TouchableOpacity
          onPress={() => authClient.signOut()}
          style={styles.logoutBtn}
        >
          <Text style={[styles.logoutText, { color: theme.colors.textGrey }]}>
            Log out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  // Footer
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
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
  logoutBtn: {
    alignItems: 'center' as const,
    paddingVertical: 10,
    marginTop: 2,
  },
  logoutText: {
    fontSize: 14,
    fontFamily: 'PublicSansRegular',
  },
}));
