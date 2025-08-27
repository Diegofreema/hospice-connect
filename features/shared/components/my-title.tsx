import { Title } from '@/components/title/Title';
import { palette } from '@/theme';
import React from 'react';
import { StyleProp, StyleSheet, TextStyle } from 'react-native';
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

const styles = StyleSheet.create({
  title: {
    color: palette.black,
    fontFamily: 'PublicSansBold',
  },
});
