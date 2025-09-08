import { Image } from 'expo-image';
import { ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';
import Text from './text';
import View from './view';
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
      <View flex={1} gap={'l'} justifyContent={'center'} alignItems={'center'}>
        <Image
          source={imageUrl}
          style={{ width: 200, height: 200 }}
          contentFit="contain"
        />

        <Text variant={'subheader'} textAlign={'center'}>
          {title}
        </Text>
        <Text variant={'body'} textAlign={'center'}>
          {description}
        </Text>
        {button}
      </View>
    </Wrapper>
  );
};
