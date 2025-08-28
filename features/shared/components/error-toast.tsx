import React from 'react';
import { getFontSize } from '../utils';
import Text from './text';
import View from './view';

type Props = {
  title: string;
  description?: string;
};

export const ErrorToast = ({ title, description }: Props) => {
  return (
    <View>
      <Text variant={'subheader'} color={'white'} fontSize={getFontSize(16)}>
        {title}
      </Text>
      <Text variant={'body'} color={'white'} fontSize={getFontSize(13)}>
        {description}
      </Text>
    </View>
  );
};

export const SuccessToast = ({ title, description }: Props) => {
  return (
    <View>
      <Text variant={'subheader'} color={'white'} fontSize={getFontSize(16)}>
        {title}
      </Text>
      <Text variant={'body'} color={'white'} fontSize={getFontSize(13)}>
        {description}
      </Text>
    </View>
  );
};
