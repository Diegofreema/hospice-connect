import { useAuth } from '@/components/context/auth';
import { ActionComponent } from '@/features/shared/components/action-component';
import { UnderReview } from '@/features/shared/components/under-review';
import { addEventListener } from '@react-native-community/netinfo';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
const ProtectedLayout = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean>(true);
  useEffect(() => {
    const unsubscribe = addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  if (!isConnected) {
    return (
      <ActionComponent
        imageUrl={require('@/assets/images/no-internet.png')}
        title={'Oops, No internet Connection'}
        description={'Please check your internet connection and try again'}
      />
    );
  }
  const isAdmin = user?.role === 'admin';

  if (isAdmin) {
    return (
      <UnderReview
        title="Admin account"
        description="Please use the web as an admin"
      />
    );
  }

  const isBoarded = !!user?.isBoarded;
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: 'white' }}
      edges={['top', 'right', 'left']}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isBoarded}>
          <Stack.Screen name="(boarded)" />
        </Stack.Protected>
        <Stack.Protected guard={!isBoarded}>
          <Stack.Screen name="(not-boarded)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default ProtectedLayout;
