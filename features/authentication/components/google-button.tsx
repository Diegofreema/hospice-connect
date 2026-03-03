import { useToast } from '@/components/demos/toast';
import { Button } from '@/features/shared/components/button';
import { generateErrorMessage } from '@/features/shared/utils';
import { authClient } from '@/lib/auth-client';
import { Image } from 'expo-image';
import React from 'react';

type Props = {
  provider: 'google' | 'apple';
};
export const LoginButton = ({ provider }: Props) => {
  const { showToast } = useToast();
  const imageSource =
    provider === 'google'
      ? require('@/assets/images/google.png')
      : require('@/assets/images/apple.png');
  const title = provider === 'google' ? 'Google' : 'Apple';
  const handleSignIn = async () => {
    try {
      const { data, error } = await authClient.signIn.social({
        provider,
      });
      if (error) {
        showToast({
          title: 'Error',
          subtitle: error.message,
          autodismiss: true,
        });
      }

      console.log({ data });

      if (data) {
        showToast({
          title: 'Success',
          subtitle: `Signed in with ${title} successfully`,
          autodismiss: true,
        });
      }
    } catch (error) {
      showToast({
        title: 'Error',
        subtitle: generateErrorMessage(
          error,
          `Failed to sign in with ${title}`,
        ),
        autodismiss: true,
      });
    }
  };
  return (
    <Button
      bg={'transparent'}
      style={{ borderColor: 'grey', borderWidth: 1, width: '100%' }}
      title={title}
      rightIcon={
        <Image
          source={imageSource}
          style={{ width: 25, height: 25 }}
          contentFit="contain"
        />
      }
      onPress={handleSignIn}
      color="black"
    />
  );
};
