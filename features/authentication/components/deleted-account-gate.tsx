import { Center } from '@/components/center/center';
import { api } from '@/convex/_generated/api';
import { Button } from '@/features/shared/components/button';
import { Text } from '@/features/shared/components/text';
import { Stack } from '@/features/shared/components/v-stack';
import { Wrapper } from '@/features/shared/components/wrapper';
import { authClient } from '@/lib/auth-client';
import { useMutation, useQuery } from 'convex/react';
import { Image } from 'expo-image';
import { type ReactNode, useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';
import { toast } from 'sonner-native';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type Props = {
  children: ReactNode;
};

export const DeletedAccountGate = ({ children }: Props) => {
  const request = useQuery(api.deleteAccount.checkDeletionStatus);
  const cancelDeletion = useMutation(api.deleteAccount.cancelDeletionRequest);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Still loading — but because PreloadData fires this query during the splash,
  // request will almost always be resolved by the time we reach here.
  // Render children immediately to avoid a blocking spinner.
  if (request === undefined) {
    return <>{children}</>;
  }

  // No pending deletion — render the app normally
  if (!request || request.status !== 'pending') {
    return <>{children}</>;
  }

  // Calculate how many days remain until deletion
  const deletionAt = request.requestedAt + THIRTY_DAYS_MS;
  const msRemaining = deletionAt - Date.now();
  const daysRemaining = Math.max(
    1,
    Math.ceil(msRemaining / (1000 * 60 * 60 * 24)),
  );

  const onRestoreAccount = async () => {
    setIsRestoring(true);
    try {
      await cancelDeletion({});
      toast.success('Account restored! Welcome back.');
    } catch {
      toast.error('Failed to restore account. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const onSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setIsSigningOut(false);
          toast.success('Logged out successfully.');
        },
        onError: () => {
          setIsSigningOut(false);
          toast.error('Failed to log out.');
        },
      },
    });
  };

  return (
    <Wrapper>
      <Center style={styles.center}>
        <Image
          source={require('@/assets/images/review.png')}
          style={styles.image}
          contentFit="contain"
        />

        <Text size="large" isBold textAlign="center" style={styles.title}>
          Account Scheduled for Deletion
        </Text>

        <Text size="normal" textAlign="center" style={styles.description}>
          You requested to delete your account.{'\n'}
          It will be permanently deleted in{' '}
          <Text size="normal" isBold>
            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
          </Text>
          .{'\n\n'}
          Changed your mind? Restore your account to continue using
          HospiceConnect.
        </Text>

        <Stack gap="md" mt="lg">
          <Button
            title={isRestoring ? 'Restoring...' : 'Restore My Account'}
            onPress={onRestoreAccount}
            disabled={isRestoring || isSigningOut}
            style={styles.restoreButton}
          />
          <Button
            title={isSigningOut ? 'Signing out...' : 'Sign Out'}
            onPress={onSignOut}
            disabled={isRestoring || isSigningOut}
            style={styles.signOutButton}
            color="#374151"
            bg="#F3F4F6"
          />
        </Stack>
      </Center>
    </Wrapper>
  );
};

const styles = StyleSheet.create((_theme) => ({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.85,
    gap: 16,
    paddingHorizontal: 24,
  },
  image: {
    width: 200,
    height: 200,
  },
  title: {
    marginTop: 8,
  },
  description: {
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    marginTop: 8,
  },
  restoreButton: {
    width: '100%',
  },
  signOutButton: {
    width: '100%',
  },
}));
