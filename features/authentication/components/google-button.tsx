import { useAuth } from '@/components/context/auth';
import { useToast } from '@/components/demos/toast';
import { Button } from '@/features/shared/components/button';
import { authClient } from '@/lib/auth-client';
import { Image } from 'expo-image';
import React, { useState } from 'react';

type Props = {
  provider: 'google' | 'apple';
};
export const LoginButton = ({ provider }: Props) => {
  const { showToast } = useToast();
  const { isPending } = useAuth();
  const [loading, setLoading] = useState(false);
  const imageSource =
    provider === 'google'
      ? require('@/assets/images/google.png')
      : require('@/assets/images/apple.png');
  const title = provider === 'google' ? 'Google' : 'Apple';
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider,
      fetchOptions: {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          showToast({
            title: 'Success',
            subtitle: `Signed in with ${title} successfully`,
            autodismiss: true,
          });
          setLoading(false);
        },
        onError: ({ error }) => {
          showToast({
            title: 'Error',
            subtitle: error.message,
            autodismiss: true,
          });
          setLoading(false);
        },
      },
    });
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
      disabled={isPending || loading}
    />
  );
};
