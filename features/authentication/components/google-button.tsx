import { Button } from '@/features/shared/components/button';
import { useAuthActions } from '@convex-dev/auth/react';
import { makeRedirectUri } from 'expo-auth-session';
import { Image } from 'expo-image';
import { openAuthSessionAsync } from 'expo-web-browser';
import React from 'react';
import { Platform } from 'react-native';

const redirectTo = makeRedirectUri();

export const GoogleButton = () => {
  const { signIn } = useAuthActions();

  const handleSignIn = async () => {
    const { redirect } = await signIn('google', { redirectTo });
    if (Platform.OS === 'web') {
      return;
    }
    const result = await openAuthSessionAsync(redirect!.toString(), redirectTo);
    if (result.type === 'success') {
      const { url } = result;
      const code = new URL(url).searchParams.get('code')!;
      await signIn('google', { code });
    }
  };
  return (
    <Button
      bg={'transparent'}
      style={{ borderColor: 'grey', borderWidth: 1, width: '100%' }}
      title="Google"
      rightIcon={
        <Image
          source={require('@/assets/images/google.png')}
          style={{ width: 25, height: 25 }}
          contentFit="contain"
        />
      }
      onPress={handleSignIn}
      color="black"
    />
  );
};
