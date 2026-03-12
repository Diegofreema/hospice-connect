import { IconClipboardHeart, IconUsers } from '@tabler/icons-react-native';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

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

export const SubscriptionHeader = () => {
  const { theme } = useUnistyles();
  return (
    <View style={{ gap: 20 }}>
      <View style={styles.heroBanner}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.heroLogo}
          contentFit="contain"
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
      <Text style={[styles.choosePlanLabel, { color: theme.colors.textGrey }]}>
        Choose your plan
      </Text>
    </View>
  );
};

const styles = StyleSheet.create(() => ({
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
}));
