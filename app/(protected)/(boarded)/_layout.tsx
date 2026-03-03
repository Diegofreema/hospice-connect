import { ChatWrapper } from '@/components/chat-wrapper';
import { useAuth } from '@/components/context/auth';
import { ChatContext } from '@/components/context/chat-context';
import { useConfigureRC } from '@/hooks/rc/use-configure-rc';
import { Stack } from 'expo-router';

const BoardedLayout = () => {
  const { user } = useAuth();

  const isNurse = user?.role === 'nurse';
  useConfigureRC();
  return (
    <ChatContext>
      <ChatWrapper>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={isNurse}>
            <Stack.Screen name="(nurse)" />
          </Stack.Protected>
          <Stack.Protected guard={!isNurse}>
            <Stack.Screen name="(hospice)" />
          </Stack.Protected>
        </Stack>
      </ChatWrapper>
    </ChatContext>
  );
};

export default BoardedLayout;
