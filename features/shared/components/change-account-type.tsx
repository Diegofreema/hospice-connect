import { useAuth } from '@/components/context/auth';
import { api } from '@/convex/_generated/api';
import { BackButton } from '@/features/shared/components/back-button';
import { Button } from '@/features/shared/components/button';
import { Text } from '@/features/shared/components/text';
import { Stack } from '@/features/shared/components/v-stack';
import { Wrapper } from '@/features/shared/components/wrapper';
import { authClient } from '@/lib/auth-client';
import { useMutation } from 'convex/react';
import React, { useState } from 'react';
import { useUnistyles } from 'react-native-unistyles';
import { toast } from 'sonner-native';

export const ChangeAccountType = () => {
  const { user } = useAuth();
  const { theme } = useUnistyles();
  const [isLoading, setIsLoading] = useState(false);

  const changeAccountTypeMutation = useMutation(api.account.changeAccountType);

  if (!user) return null;

  const currentRole = user.role as 'nurse' | 'hospice';
  const targetRole = currentRole === 'nurse' ? 'hospice' : 'nurse';

  const handleSwitchAccount = async () => {
    setIsLoading(true);
    try {
      // 1. Execute DB checks and hard deletions via Convex
      const { success } = await changeAccountTypeMutation({
        currentAccountType: currentRole,
      });

      // 2. Update session status so the user logs out of current boarded state UI
      // and goes back to onboarding page for the new role.
      if (success) {
        await authClient.updateUser({
          role: undefined,
          isBoarded: false,
        });

        toast.success(
          `Account type changed successfully. Please onboard as a ${targetRole}.`,
        );
      } else {
        toast.error(`Failed to change account type. Please try again.`);
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          'An error occurred while changing your account type.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper>
      <BackButton marginTop={0} title="Change Account Type" />

      <Stack flex={1} mt="xl" gap="xl">
        <Stack
          padding="lg"
          gap="md"
          style={{
            backgroundColor: 'rgba(255, 0, 0, 0.05)',
            borderRadius: theme.margins.md,
            borderWidth: 1,
            borderColor: 'rgba(255, 0, 0, 0.2)',
          }}
        >
          <Text size="large" isBold color="red">
            Danger Zone
          </Text>
          <Text size="normal" color="dimmed">
            Changing your account type from{' '}
            <Text isBold color="black" style={{ textTransform: 'capitalize' }}>
              {currentRole}
            </Text>{' '}
            to{' '}
            <Text isBold color="black" style={{ textTransform: 'capitalize' }}>
              {targetRole}
            </Text>{' '}
            is an irreversible action.
          </Text>
          <Text size="normal" color="dimmed">
            All your current profile data, including verification status and
            preferences, will be permanently deleted.
          </Text>
          <Text size="normal" color="dimmed">
            You will be required to complete the onboarding process from scratch
            as a {targetRole}.
          </Text>
        </Stack>
      </Stack>

      <Stack mb="xl">
        <Button
          disabled={isLoading}
          onPress={handleSwitchAccount}
          title={
            isLoading
              ? 'Switching...'
              : `Switch to ${
                  targetRole.charAt(0).toUpperCase() + targetRole.slice(1)
                } Account`
          }
          bg="red"
        />
      </Stack>
    </Wrapper>
  );
};
