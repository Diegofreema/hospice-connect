import { HospiceProvider } from '@/components/context/hospice-context';
import { Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

const HospiceLayout = () => {
  return (
    <HospiceProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
        <Stack.Screen
          name="(other-screens)/extend/[id]"
          options={{
            presentation: 'modal',
            animation:
              Platform.OS === 'android' ? 'slide_from_bottom' : 'default',
          }}
        />
      </Stack>
    </HospiceProvider>
  );
};

export default HospiceLayout;
