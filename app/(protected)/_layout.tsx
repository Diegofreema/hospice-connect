import { Stack } from 'expo-router';
import React from 'react';

const ProtectedLayout = () => {
  return <Stack screenOptions={{ headerShown: false }} />;
};

export default ProtectedLayout;
