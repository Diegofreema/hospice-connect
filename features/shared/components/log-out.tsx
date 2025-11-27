import { useToast } from '@/components/demos/toast';
import { authClient } from '@/lib/auth-client';
import { IconLogout2 } from '@tabler/icons-react-native';
import { useState } from 'react';
import { useUnistyles } from 'react-native-unistyles';
import { Button } from './button';

export const LogOut = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { theme } = useUnistyles();
  const onPress = async () => {
    setLoading(true);
    try {
      await authClient.signOut();
      showToast({
        title: 'Success',
        subtitle: 'You have successfully logged out',
        autodismiss: true,
      });
    } catch (error) {
      console.log({ error });

      showToast({
        title: 'Error',
        subtitle: 'Failed to log out',
        autodismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      title="Logout"
      onPress={onPress}
      disabled={loading}
      bg={theme.colors.buttonGrey}
      color={theme.colors.redDark}
      rightIcon={<IconLogout2 size={20} color={theme.colors.redDark} />}
    />
  );
};
