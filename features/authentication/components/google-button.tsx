import { useToast } from '@/components/demos/toast';
import { Button } from '@/features/shared/components/button';
import { generateErrorMessage } from '@/features/shared/utils';
import { authClient } from '@/lib/auth-client';
import { Image } from 'expo-image';
import React from 'react';

export const GoogleButton = () => {
  const { showToast } = useToast();
  const handleSignIn = async () => {
    try {
      const { data, error } = await authClient.signIn.social({
        provider: 'google',
      });
      if (error) {
        showToast({
          title: 'Error',
          subtitle: error.message,
          autodismiss: true,
        });
      }
      if (data) {
        showToast({
          title: 'Success',
          subtitle: 'Signed in with Google successfully',
          autodismiss: true,
        });
      }
    } catch (error) {
      showToast({
        title: 'Error',
        subtitle: generateErrorMessage(error, 'Failed to sign in with Google'),
        autodismiss: true,
      });
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
