import * as WebBrowser from 'expo-web-browser';

import { authClient } from '@/lib/auth-client';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// Apple's standard EULA — required when using Apple's standard Terms of Use
const APPLE_EULA_URL =
  'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL = 'https://hospice-connect-web.vercel.app/privacy';

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
      {/* ── Subscription disclosure (required by Apple) ── */}
      <Text style={[styles.disclosure, { color: theme.colors.textGrey }]}>
        {activePackage
          ? `${activePackage.product.title} · ${activePackage.product.priceString} — subscription auto-renews unless cancelled at least 24 hours before the end of the current period. Manage or cancel anytime in your App Store account settings.`
          : 'Subscription auto-renews unless cancelled at least 24 hours before the period ends.'}
      </Text>

      {/* ── Legal links ── */}
      <View style={styles.footerLinks}>
        <TouchableOpacity onPress={() => handleOpenLink(APPLE_EULA_URL)}>
          <Text style={[styles.footerLink, { color: theme.colors.textGrey }]}>
            Terms of Use
          </Text>
        </TouchableOpacity>
        <Text style={[styles.footerDot, { color: theme.colors.textGrey }]}>
          ·
        </Text>
        <TouchableOpacity onPress={() => handleOpenLink(PRIVACY_URL)}>
          <Text style={[styles.footerLink, { color: theme.colors.textGrey }]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── CTA ── */}
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
  // Disclosure text
  disclosure: {
    fontSize: 11,
    fontFamily: 'PublicSansRegular',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },

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
    textDecorationLine: 'underline',
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
