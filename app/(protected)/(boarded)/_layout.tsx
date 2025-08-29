import { useAuth } from '@/components/context/auth';
import { LoadingComponent } from '@/features/shared/components/loading';
import { Stack } from 'expo-router';
import React from 'react';

const BoardedLayout = () => {
  const { user } = useAuth();
  if (!user) return <LoadingComponent />;

  const isNurse = !!user.isNurse;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isNurse}>
        <Stack.Screen name="(nurse)" />
      </Stack.Protected>
      <Stack.Protected guard={!isNurse}>
        <Stack.Screen name="(hospice)" />
      </Stack.Protected>
    </Stack>
  );
};

export default BoardedLayout;
