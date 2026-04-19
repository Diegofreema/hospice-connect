import '@/unistyles';
import '../global.css';

import { AnimatedView } from '@/components/animated-view';
import { useAuth } from '@/components/context/auth';
import { StackedModalProvider } from '@/components/demos/modal/modal-manager';
import { ToastProvider } from '@/components/demos/toast';
import Provider from '@/components/provider';
import { api } from '@/convex/_generated/api';
import { ErrorComponent } from '@/features/shared/components/error';
import { useAnimationStore } from '@/hooks/use-animation';
import { useFonts } from 'expo-font';
import {
  type ErrorBoundaryProps,
  Stack,
  usePathname,
  useSegments,
} from 'expo-router';

import { generateErrorMessage } from '@/features/shared/utils';
import { useSubscribeNotification } from '@/hooks/rc/use-subscribe-notification';
import { useUpdate } from '@/hooks/use-update';
import notifee, { EventType } from '@notifee/react-native';
import { useQuery } from 'convex/react';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Toaster } from 'sonner-native';
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

notifee.onBackgroundEvent(async ({ detail, type }) => {
  if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
    // Prefer channel_cid (full cid e.g. "messaging:abc123") over channel_id
    // (bare id e.g. "abc123") — both formats are handled by useStreamChannelQuery.
    const data = detail.notification?.data as
      | Record<string, string | undefined>
      | undefined;
    const channelId = data?.channel_cid ?? data?.channel_id;
    if (channelId) {
      // Store the channel ID instead of navigating directly. The app may
      // be cold-starting, and ChatWrapper's conditional <Chat> will cause
      // a tree remount that wipes any navigation performed before the
      // client is ready. ChatWrapper will consume this and navigate.
      router.push(`/channel/${channelId}`);
    }
    await Promise.resolve();
  }
});

export function ErrorBoundary({ retry, error }: ErrorBoundaryProps) {
  const errorMessage = generateErrorMessage(error, error.message);
  return <ErrorComponent refetch={retry} text={errorMessage} />;
}
export default function RootLayout() {
  const isFinished = useAnimationStore((state) => state.isFinished);
  const { isPending } = useAuth();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    PublicSansBold: require('@/assets/fonts/PublicSans-Bold.ttf'),
    PublicSansSemiBold: require('@/assets/fonts/PublicSans-SemiBold.ttf'),
    PublicSansMedium: require('@/assets/fonts/PublicSans-Medium.ttf'),
    PublicSansRegular: require('@/assets/fonts/PublicSans-Regular.ttf'),
    PublicSansLight: require('@/assets/fonts/PublicSans-Light.ttf'),
  });

  useUpdate();

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const showSplash = !isFinished && Platform.OS !== 'web' && isPending;

  // Provider is now outside the animation gate so auth + Convex resolve
  // during the 6-second splash — the app shows fully loaded once the
  // animation finishes.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider>
        {showSplash ? (
          <>
            <AnimatedView />
            {/* Invisibly pre-fetch data so it is cached before the splash ends */}
            <PreloadData />
          </>
        ) : (
          <View style={styles.container}>
            <KeyboardProvider>
              <InitialRoute />
              <Toaster />
            </KeyboardProvider>
          </View>
        )}
      </Provider>
    </GestureHandlerRootView>
  );
}

// ---------------------------------------------------------------------------
// PreloadData — renders nothing but fires Convex queries for the authenticated
// user during the splash animation so the data is already cached when routes
// mount.  Sub-components are conditionally rendered (not hooks called
// conditionally) to stay within React's rules of hooks.
// ---------------------------------------------------------------------------

const PreloadDeletionStatus = () => {
  useQuery(api.deleteAccount.checkDeletionStatus);
  return null;
};

const PreloadNurse = ({ userId }: { userId: string }) => {
  useQuery(api.nurses.getNurseById, { userId });
  return null;
};

const PreloadHospice = () => {
  useQuery(api.hospices.getHospiceByUserId);
  return null;
};

const PreloadData = () => {
  const { user, isPending } = useAuth();

  // Nothing to pre-fetch until auth resolves or for non-mobile sessions
  if (isPending || !user || user.role === 'admin') return null;

  return (
    <>
      <PreloadDeletionStatus />
      {user.isBoarded && user.role === 'nurse' && (
        <PreloadNurse userId={user.id} />
      )}
      {user.isBoarded && user.role !== 'nurse' && <PreloadHospice />}
    </>
  );
};

const InitialRoute = () => {
  const { theme } = useUnistyles();
  const [initialChannelId, setInitialChannelId] = useState<string>();
  const { user, isPending } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const segment = useSegments();
  const pathname = usePathname();
  const isWeb = Platform.OS === 'web';
  console.log({ pathname, segment });
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);
  useSubscribeNotification({ setInitialChannelId });
  useEffect(() => {
    if (isMounted && initialChannelId && !isPending && user) {
      router.push(`/channel/${initialChannelId}`);
      setInitialChannelId(undefined);
    }
  }, [initialChannelId, isMounted, isPending, user]);

  // usePendingImageRedirect(!isPending);

  return (
    <ToastProvider>
      <StackedModalProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTitleStyle: {
              color: theme.colors.typography,
            },
            headerTintColor: theme.colors.typography,
            headerShown: false,
          }}
        >
          <Stack.Protected guard={isWeb}>
            <Stack.Screen name="(admin)" />
          </Stack.Protected>
          <Stack.Protected guard={!isWeb}>
            <Stack.Protected guard={isAuthenticated}>
              <Stack.Screen name="(protected)" />
            </Stack.Protected>
            <Stack.Protected guard={!isAuthenticated}>
              <Stack.Screen name="(public)" />
            </Stack.Protected>
          </Stack.Protected>
        </Stack>
      </StackedModalProvider>
    </ToastProvider>
  );
};
const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },
}));
