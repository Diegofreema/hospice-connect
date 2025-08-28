import React from 'react';
import { View } from 'react-native';

type Props = {
  height?: number;
};

export const Spacer = ({ height = 20 }: Props) => {
  return <View style={{ height }} />;
};
