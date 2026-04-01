import { useAuth } from '@/components/context/auth';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

//...

export const useConfigureRC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === 'ios') {
      Purchases.configure({
        apiKey: 'appl_iNVtzSygqQqsuOTTEhwumMBAgow',
        appUserID: user?.id,
      });
    } else if (Platform.OS === 'android') {
      Purchases.configure({
        apiKey: 'goog_nOEvpbJXIvSITLBWyRHueuAnPBD',
        appUserID: user?.id,
      });
    }
  }, [user?.id]);
};
