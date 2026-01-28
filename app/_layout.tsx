import { AnimatedView } from '@/components/animated-view';
import { useAuth } from '@/components/context/auth';
import { StackedModalProvider } from '@/components/demos/modal/modal-manager';
import { ToastProvider } from '@/components/demos/toast';
import Provider from '@/components/provider';
import { ErrorComponent } from '@/features/shared/components/error';
import { useAnimationStore } from '@/hooks/use-animation';
import { useFonts } from 'expo-font';
import {
  type ErrorBoundaryProps,
  Stack,
  usePathname,
  useSegments,
} from 'expo-router';
import '../global.css';

import { useUpdate } from '@/hooks/use-update';
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

  if (!isFinished && Platform.OS !== 'web') {
    return <AnimatedView />;
  }

  return (
    <Provider>
      <View style={styles.container}>
        <KeyboardProvider>
          <InitialRoute />
          <Toaster />
        </KeyboardProvider>
      </View>
    </Provider>
  );
}

const InitialRoute = () => {
  const { theme } = useUnistyles();

  const { user } = useAuth();
  const segment = useSegments();
  const pathname = usePathname();
  const isWeb = Platform.OS === 'web';
  console.log({ pathname, segment, isWeb });
  const isAuthenticated = !!user;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
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
