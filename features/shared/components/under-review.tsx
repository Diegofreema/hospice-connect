import { Center } from '@/components/center/center';
import { Image } from 'expo-image';

import { authClient } from '@/lib/auth-client';
import { router } from 'expo-router';
import { useState } from 'react';
import { toast } from 'sonner-native';
import { Button } from './button';
import { MyTitle } from './my-title';
import { Text } from './text';
import { Wrapper } from './wrapper';

type Props = {
  title?: string;
  description?: string;
  type?: 'card';
};
export const UnderReview = ({
  title = 'Account Under Review',
  description = 'We are currently verifying your information. Please check back shortly',
  type,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const onLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setLoading(false);
          toast.success('Logged out successfully');
        },
        onError: () => {
          setLoading(false);
          toast.error('Failed to log out');
        },
        onRequest: () => {
          setLoading(true);
        },
      },
    });
  };
  const image =
    type === 'card'
      ? require('@/assets/images/card.png')
      : require('@/assets/images/review.png');
  const buttonTitle = () => {
    if (type === 'card') {
      return 'Add Card';
    }
    return 'Logout';
  };

  const onPress = () => {
    if (type === 'card') {
      router.push('/billing');
      return;
    }
    onLogout();
  };
  return (
    <Wrapper>
      <Center
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 0.6,
          gap: 10,
        }}
      >
        <Image
          source={image}
          style={{ width: 200, height: 200 }}
          contentFit="contain"
        />
        <MyTitle title={title} />
        <Text size={'normal'} textAlign={'center'}>
          {description}
        </Text>
        <Button
          title={buttonTitle()}
          onPress={onPress}
          disabled={loading}
          style={{ width: '100%' }}
        />
      </Center>
    </Wrapper>
  );
};
