import { Title } from '@/components/title/Title';

import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { getFontSize } from '../utils';

type Props = {
  title: string;
  style?: StyleProp<TextStyle>;
};

export const MyTitle = ({ title, style }: Props) => {
  return (
    <Title style={[styles.title, style]} size={getFontSize(22)}>
      {title}
    </Title>
  );
};

const styles = StyleSheet.create((theme) => ({
  title: {
    color: theme.colors.black,
    fontFamily: 'PublicSansBold',
  },
}));
