import { Stack } from 'expo-router';
import React from 'react';

const NotBoardedLayout = () => {
  return (
    <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName="select-account"
    />
  );
};

export default NotBoardedLayout;
