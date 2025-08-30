import { palette } from '@/theme';
import { IconArrowLeft } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

import View from './view';

type Props = {
  title?: string;
  rightContent?: React.ReactNode;
  marginTop?: number;
};
export const BackButton = ({ title, rightContent, marginTop = 30 }: Props) => {
  return (
    <View
      flexDirection={'row'}
      alignItems={'center'}
      justifyContent={'space-between'}
    >
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop }}>
        <IconArrowLeft size={30} color={palette.black} />
      </TouchableOpacity>
      {title ? (
        <Text
          style={{
            fontSize: 20,
            fontFamily: 'PublicSansBold',
            marginTop,
            marginLeft: -20,
          }}
        >
          {title}
        </Text>
      ) : (
        <View height={30} width={10} />
      )}
      {rightContent ? rightContent : <View height={30} width={10} />}
    </View>
  );
};
