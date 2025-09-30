import { IconArrowLeft } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { Stack } from './v-stack';

type Props = {
  title?: string;
  rightContent?: React.ReactNode;
  marginTop?: number;
  marginLeft?: number;
};
export const BackButton = ({
  title,
  rightContent,
  marginTop = 30,
  marginLeft = -20,
}: Props) => {
  const { theme } = useUnistyles();
  return (
    <Stack mode="flex">
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop }}>
        <IconArrowLeft size={30} color={theme.colors.black} />
      </TouchableOpacity>
      {title ? (
        <Text
          style={{
            fontSize: 20,
            fontFamily: 'PublicSansBold',
            marginTop,
            marginLeft,
          }}
        >
          {title}
        </Text>
      ) : (
        <View style={{ height: 30, width: 10 }} />
      )}
      {rightContent ? rightContent : <View style={{ height: 30, width: 10 }} />}
    </Stack>
  );
};
