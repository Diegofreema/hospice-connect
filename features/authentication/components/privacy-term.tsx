import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { Text } from '@/features/shared/components/text';
import { getFontSize } from '@/features/shared/utils';

import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUnistyles } from 'react-native-unistyles';

export const PrivacyTermsLink = () => {
  const { bottom } = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const onGoToTermsPage = () => {
    router.push('/terms');
  };
  const onGoToPrivacyPage = () => {
    router.push('/privacy');
  };
  return (
    <View style={{ marginTop: 'auto', marginBottom: bottom + 40 }}>
      <Text size={'small'} textAlign={'center'}>
        By signing up, you agree to our{' '}
        <PrivacyNoticeLink
          tint={theme.colors.blue}
          size={getFontSize(13)}
          style={{
            alignItems: 'flex-end',

            marginBottom: -10,
          }}
          onPress={onGoToTermsPage}
        >
          Terms & Conditions
        </PrivacyNoticeLink>
        , acknowledging our{' '}
        <PrivacyNoticeLink
          onPress={onGoToPrivacyPage}
          tint={theme.colors.blue}
          size={getFontSize(13)}
        >
          Privacy Policy
        </PrivacyNoticeLink>
        , and confirm that you are above 18.
      </Text>
    </View>
  );
};
