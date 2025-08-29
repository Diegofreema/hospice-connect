import { Center } from '@/components/center/center';
import { Image } from 'expo-image';

import { MyTitle } from './my-title';
import Text from './text';
import { Wrapper } from './wrapper';

export const UnderReview = () => {
  return (
    <Wrapper>
      <Center
        style={{ alignItems: 'center', justifyContent: 'center', flex: 0.6 }}
      >
        <Image
          source={require('@/assets/images/review.png')}
          style={{ width: 200, height: 200 }}
          contentFit="contain"
        />
        <MyTitle title="Account Under Review" />
        <Text variant={'body'} textAlign={'center'}>
          We are currently verifying your information. You will be contacted
          shortly
        </Text>
      </Center>
    </Wrapper>
  );
};
