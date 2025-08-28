import { ThemeProvider } from '@shopify/restyle';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { useAuth } from '@/components/context/auth';
import Provider from '@/components/provider';
import theme, { palette } from '@/theme';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      <SafeAreaView
        style={{ flex: 1, backgroundColor: palette.blue }}
        edges={['top', 'right', 'left']}
      >
        <Provider>
          <View style={styles.container}>
            <KeyboardProvider>
              <InitialRoute />
            </KeyboardProvider>
          </View>
        </Provider>
      </SafeAreaView>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

const InitialRoute = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(public)" />
      </Stack.Protected>
    </Stack>
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
