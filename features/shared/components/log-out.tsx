import { useToast } from '@/hooks/use-toast';
import { palette } from '@/theme';
import { useAuthActions } from '@convex-dev/auth/react';
import { IconLogout2 } from '@tabler/icons-react-native';
import { useState } from 'react';
import { Button } from './button';

export const LogOut = () => {
  const { signOut } = useAuthActions();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const onPress = async () => {
    setLoading(true);
    try {
      await signOut();
      showToast({
        title: 'Success',
        description: 'You have successfully logged out',
        type: 'success',
      });
    } catch (error) {
      console.log({ error });

      showToast({
        title: 'Error',
        description: 'Failed to log out',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      label="Logout"
      onPress={onPress}
      loading={loading}
      disabled={loading}
      loadingText="Logging out"
      backgroundColor={'buttonGrey'}
      color="backgroundRed"
      rightIcon={<IconLogout2 size={20} color={palette.redDark} />}
    />
  );
};
