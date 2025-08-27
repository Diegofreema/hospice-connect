import { Title } from '@/components/title/Title';
import { palette } from '@/theme';
import React from 'react';
import { StyleSheet } from 'react-native';
import { getFontSize } from '../utils';

type Props = {
  title: string;
};

export const MyTitle = ({ title }: Props) => {
  return (
    <Title style={styles.title} size={getFontSize(22)}>
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
