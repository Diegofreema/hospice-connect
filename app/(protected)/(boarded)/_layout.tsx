import { ChatWrapper } from '@/components/chat-wrapper';
import { useAuth } from '@/components/context/auth';
import { ChatContext } from '@/components/context/chat-context';
import { Stack } from 'expo-router';
import React from 'react';

const BoardedLayout = () => {
  const { user } = useAuth();

  const isNurse = !!user?.isNurse;
  return (
    <ChatWrapper>
      <ChatContext>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={isNurse}>
            <Stack.Screen name="(nurse)" />
          </Stack.Protected>
          <Stack.Protected guard={!isNurse}>
            <Stack.Screen name="(hospice)" />
          </Stack.Protected>
        </Stack>
      </ChatContext>
    </ChatWrapper>
  );
};

export default BoardedLayout;
