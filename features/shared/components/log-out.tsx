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
import { api } from '@/convex/_generated/api';
import { authClient } from '@/lib/auth-client';
import { IconLogout2 } from '@tabler/icons-react-native';
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { useUnistyles } from 'react-native-unistyles';
import { toast } from 'sonner-native';
import { generateErrorMessage } from '../utils';
import { Button } from './button';

export const LogOut = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { theme } = useUnistyles();
  const removeToken = useMutation(api.pushNotifications.removeToken);

  const onConfirmLogout = async () => {
    setLoading(true);
    try {
      await removeToken();
      await authClient.signOut();
      toast('Success', {
        description: 'You have successfully logged out',
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(error, 'Failed to log out');
      showToast({
        title: 'Error',
        subtitle: errorMessage,
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
