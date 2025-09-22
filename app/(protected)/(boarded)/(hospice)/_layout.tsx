import { HospiceProvider } from '@/components/context/hospice-context';
import { Stack } from 'expo-router';
import React from 'react';

const HospiceLayout = () => {
  return (
    <HospiceProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </HospiceProvider>
  );
};

export default HospiceLayout;
