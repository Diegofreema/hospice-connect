import { Center } from '@/components/center/center';
import { Image } from 'expo-image';

import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { toast } from 'sonner-native';
import { Button } from './button';
import { MyTitle } from './my-title';
import { Text } from './text';
import { Wrapper } from './wrapper';

type Props = {
  title?: string;
  description?: string;
};
export const UnderReview = ({
  title = 'Account Under Review',
  description = 'We are currently verifying your information. You will be contacted shortly',
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
          source={require('@/assets/images/review.png')}
          style={{ width: 200, height: 200 }}
          contentFit="contain"
        />
        <MyTitle title={title} />
        <Text size={'normal'} textAlign={'center'}>
          {description}
        </Text>
        <Button
          title="Logout"
          onPress={onLogout}
          disabled={loading}
          style={{ width: '100%' }}
        />
      </Center>
    </Wrapper>
  );
};
