import { useAuth } from '@/components/context/auth';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

export const useConfigureRC = () => {
  const { user } = useAuth();
  const isConfigured = useRef(false);

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (!isConfigured.current) {
      // First-time SDK setup — no appUserID so RC generates an anonymous ID.
      // We'll identify the real user with logIn() below.
      if (Platform.OS === 'ios') {
        Purchases.configure({
          apiKey: 'appl_iNVtzSygqQqsuOTTEhwumMBAgow',
        });
      } else if (Platform.OS === 'android') {
        Purchases.configure({
          apiKey: 'goog_nOEvpbJXIvSITLBWyRHueuAnPBD',
        });
      }
      isConfigured.current = true;
    }

    if (user?.id) {
      // Switch RC to this user's identity.
      // logIn() is safe to call even if the same user is already logged in.
      Purchases.logIn(user.id).catch((err) =>
        console.warn('[RC] logIn error:', err),
      );
    } else {
      // No user (logged out) — revert to an anonymous RC identity so the
      // next user starts with a clean slate.
      Purchases.logOut().catch((err) =>
        console.warn('[RC] logOut error:', err),
      );
    }
  }, [user?.id]);
};
