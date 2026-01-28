import { Center } from '@/components/center/center';
import { Image } from 'expo-image';

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
        <MyTitle title={title} />
        <Text size={'normal'} textAlign={'center'}>
          {description}
        </Text>
      </Center>
    </Wrapper>
  );
};
