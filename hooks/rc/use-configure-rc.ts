import { useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

//...

export const useConfigureRC = () => {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === 'ios') {
      //    Purchases.configure({apiKey: <revenuecat_project_apple_api_key>});
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: 'goog_nOEvpbJXIvSITLBWyRHueuAnPBD' });
    }
  }, []);
};
