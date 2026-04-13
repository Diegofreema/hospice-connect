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

import { useSubscribeNotification } from '@/hooks/rc/use-subscribe-notification';
import { usePendingImageRedirect } from '@/hooks/use-pending-image-redirect';
import { useUpdate } from '@/hooks/use-update';
import { useQuery } from 'convex/react';
import React from 'react';
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

export function ErrorBoundary({ retry, error }: ErrorBoundaryProps) {
  return <ErrorComponent refetch={retry} text={error.message} />;
}
export default function RootLayout() {
  const isFinished = useAnimationStore((state) => state.isFinished);

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

  const showSplash = !isFinished && Platform.OS !== 'web';

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

  const { user, isPending } = useAuth();
  const segment = useSegments();
  const pathname = usePathname();
  const isWeb = Platform.OS === 'web';
  console.log({ pathname, segment });
  const isAuthenticated = !!user;
  useSubscribeNotification();

  // Check for pending image picker results after Activity restart.
  // Only redirect once auth is resolved (!isPending) so nav guards are stable.
  usePendingImageRedirect(!isPending);

  // Wait for auth to resolve before rendering navigation guards.
  // This prevents flashing the login screen during Android cold-start
  // (e.g. after the OS destroys the activity while the gallery is open).

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
