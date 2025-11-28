import React from 'react';
import { Text } from './text';
import { View } from './view';
import { Wrapper } from './wrapper';

export const MessageEmpty = () => {
  return (
    <Wrapper>
      <View flex={1} justifyContent="center" alignItems="center">
        <Text size="medium" isBold>
          No messages yet
        </Text>
        <Text size="normal">Your messages will be found here!!</Text>
      </View>
    </Wrapper>
  );
};
