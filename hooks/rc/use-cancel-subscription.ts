import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import Purchases from 'react-native-purchases';

export const useCancelSubscription = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openManagementURL = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const url = customerInfo.managementURL;
      if (url) {
        await Linking.openURL(url);
      } else {
        // Fallback: open Play Store subscriptions page
        await Linking.openURL(
          'https://play.google.com/store/account/subscriptions',
        );
      }
    } catch (err) {
      console.error('[useCancelSubscription]', err);
      setError('Failed to open subscription management. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { openManagementURL, isLoading, error };
};
