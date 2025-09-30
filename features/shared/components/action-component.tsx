import { Image } from 'expo-image';
import { ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';
import { Text } from './text';

import { Stack } from './v-stack';
import { Wrapper } from './wrapper';

type Props = {
  title: string;
  description: string;
  button?: ReactNode;
  imageUrl: ImageSourcePropType;
};

export const ActionComponent = ({
  imageUrl,
  title,
  button,
  description,
}: Props) => {
  return (
    <Wrapper>
      <Stack flex={1} gap={'lg'} isCentered>
        <Image
          source={imageUrl}
          style={{ width: 200, height: 200 }}
          contentFit="contain"
        />

        <Text size={'large'} textAlign={'center'}>
          {title}
        </Text>
        <Text size={'normal'} textAlign={'center'}>
          {description}
        </Text>
        {button}
      </Stack>
    </Wrapper>
  );
};
