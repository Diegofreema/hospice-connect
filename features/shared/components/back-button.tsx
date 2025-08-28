import { palette } from '@/theme';
import { IconArrowLeft } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export const BackButton = () => {
  return (
    <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 30 }}>
      <IconArrowLeft size={30} color={palette.black} />
    </TouchableOpacity>
  );
};
