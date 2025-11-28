import { useToast } from '@/components/demos/toast';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/dialog/Dialog';
import { authClient } from '@/lib/auth-client';
import { IconLogout2 } from '@tabler/icons-react-native';
import { useState } from 'react';
import { useUnistyles } from 'react-native-unistyles';
import { Button } from './button';

export const LogOut = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { theme } = useUnistyles();

  const onConfirmLogout = async () => {
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
    <Dialog>
      <DialogTrigger asChild>
        <Button
          title="Logout"
          disabled={loading}
          bg={theme.colors.buttonGrey}
          color={theme.colors.redDark}
          rightIcon={<IconLogout2 size={20} color={theme.colors.redDark} />}
        />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogDescription>
            Are you sure you want to log out?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              title="Cancel"
              disabled={loading}
              bg={theme.colors.buttonGrey}
              color={theme.colors.redDark}
            />
          </DialogClose>
          <Button
            title={loading ? 'Logging out…' : 'Log out'}
            disabled={loading}
            bg={theme.colors.redDark}
            color={theme.colors.white}
            onPress={onConfirmLogout}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
