import { NurseProvider } from '@/components/context/nurse-context';
import { Stack } from 'expo-router';
import React from 'react';

const NurseLayout = () => {
  console.log('NurseLayout');

  return (
    <NurseProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </NurseProvider>
  );
};

export default NurseLayout;
