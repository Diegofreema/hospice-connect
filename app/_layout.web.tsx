import { useAuth } from '@/components/context/auth';
import { StackedModalProvider } from '@/components/demos/modal/modal-manager';
import { ToastProvider } from '@/components/demos/toast';
import Provider from '@/components/provider';
import { ErrorComponent } from '@/features/shared/components/error';
import { useFonts } from 'expo-font';
import {
  type ErrorBoundaryProps,
  Stack,
  usePathname,
  useSegments,
} from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Toaster } from 'sonner-native';

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
    return null;
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
  console.log({ pathname, segment });

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
            {/* Web: Show only admin portal */}
            <Stack.Screen name="(admin)" />
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
