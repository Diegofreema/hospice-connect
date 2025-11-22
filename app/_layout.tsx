import { ToastProvider } from '@/components/demos/toast';
import Provider from '@/components/provider';
import { ErrorComponent } from '@/features/shared/components/error';

import { StackedModalProvider } from '@/components/demos/modal/modal-manager';
import { useAnimationStore } from '@/hooks/use-animation';
import { setupBackgroundUpdates } from '@/updates';
import { useConvexAuth } from 'convex/react';
import { useFonts } from 'expo-font';
import { ErrorBoundaryProps, Stack, usePathname } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

void setupBackgroundUpdates();
export function ErrorBoundary({ retry, error }: ErrorBoundaryProps) {
  return <ErrorComponent refetch={retry} text={error.message} />;
}
export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    PublicSansBold: require('@/assets/fonts/PublicSans-Bold.ttf'),
    PublicSansSemiBold: require('@/assets/fonts/PublicSans-SemiBold.ttf'),
    PublicSansMedium: require('@/assets/fonts/PublicSans-Medium.ttf'),
    PublicSansRegular: require('@/assets/fonts/PublicSans-Regular.ttf'),
    PublicSansLight: require('@/assets/fonts/PublicSans-Light.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <Provider>
      <View style={styles.container}>
        <KeyboardProvider>
          <InitialRoute />
        </KeyboardProvider>
      </View>
    </Provider>
  );
}

const InitialRoute = () => {
  const { theme } = useUnistyles();
  const { isAuthenticated } = useConvexAuth();
  const isFinished = useAnimationStore((state) => state.isFinished);
  const pathname = usePathname();
  console.log({ pathname });

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
            <Stack.Protected guard={isFinished}>
              <Stack.Protected guard={isAuthenticated}>
                <Stack.Screen name="(protected)" />
              </Stack.Protected>
              <Stack.Protected guard={!isAuthenticated}>
                <Stack.Screen name="(public)" />
              </Stack.Protected>
            </Stack.Protected>
            <Stack.Protected guard={!isFinished}>
              <Stack.Screen name="(animation)" />
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
