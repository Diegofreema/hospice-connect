import { ChatWrapper } from '@/components/chat-wrapper';
import { useAuth } from '@/components/context/auth';
import { ChatContext } from '@/components/context/chat-context';
import Provider from '@/components/provider';
import { ToastProviderWithViewport } from '@/components/toast';
import { ErrorComponent } from '@/features/shared/components/error';

import theme, { palette } from '@/theme';
import { ThemeProvider } from '@shopify/restyle';
import { useFonts } from 'expo-font';
import { ErrorBoundaryProps, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';

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
    <ThemeProvider theme={theme}>
      <Provider>
        <View style={styles.container}>
          <KeyboardProvider>
            <ChatWrapper>
              <ChatContext>
                <InitialRoute />
              </ChatContext>
            </ChatWrapper>
          </KeyboardProvider>
        </View>
      </Provider>
    </ThemeProvider>
  );
}

const InitialRoute = () => {
  const { isAuthenticated } = useAuth();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProviderWithViewport>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen name="(protected)" />
          </Stack.Protected>
          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="(public)" />
          </Stack.Protected>
        </Stack>
      </ToastProviderWithViewport>
    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
    overflow: 'hidden',
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },
});
