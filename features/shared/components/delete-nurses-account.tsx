import { useAuth } from '@/components/context/auth';
import { api } from '@/convex/_generated/api';
import { authClient } from '@/lib/auth-client';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react-native';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { toast } from 'sonner-native';
import { Button } from './button';
import { Textarea } from './text-area';

export const DeleteNursesAccount = () => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { theme } = useUnistyles();
  const { user } = useAuth();

  // Check if there is already a pending deletion request
  const deletionStatus = useQuery(api.deleteAccount.checkDeletionStatus);
  const hasPendingRequest = deletionStatus?.status === 'pending';

  const requestDeletion = useMutation(api.deleteAccount.requestAccountDeletion);
  const cancelDeletion = useMutation(api.deleteAccount.cancelDeletionRequest);

  // ── Cancel a pending deletion request ──────────────────────────────────────
  const handleCancelDeletion = () => {
    Alert.alert(
      'Cancel Deletion Request',
      'Are you sure you want to keep your account? Your deletion request will be cancelled.',
      [
        { text: 'No, keep deleting', style: 'cancel' },
        {
          text: 'Yes, keep my account',
          style: 'default',
          onPress: async () => {
            setIsCancelling(true);
            try {
              await cancelDeletion({});
              toast.success('Deletion request cancelled', {
                description: 'Your account is safe. Welcome back!',
              });
            } catch (err: any) {
              const message =
                err?.data?.message ?? err?.message ?? 'Something went wrong.';
              toast.error('Failed to cancel request', { description: message });
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ],
    );
  };

  // ── Submit a new deletion request ──────────────────────────────────────────
  const handleDelete = () => {
    if (!reason.trim()) {
      Alert.alert('Required', 'Please let us know why you are leaving.');
      return;
    }

    Alert.alert(
      'Are you absolutely sure?',
      'This action cannot be undone. Your account and all associated data will be permanently deleted within 30 days.',
      [
        { text: 'Keep My Account', style: 'cancel' },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user?.email) return;
            setIsSubmitting(true);
            try {
              await requestDeletion({
                email: user.email,
                reason,
                confirmDeletion: true,
              });
              toast.success('Deletion request submitted', {
                description:
                  'Your account will be permanently deleted within 30 days.',
              });
              await authClient.signOut();
            } catch (err: any) {
              const message =
                err?.data?.message ??
                err?.message ??
                'Something went wrong. Please try again.';
              toast.error('Failed to submit request', { description: message });
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ],
    );
  };

  // ── Loading state while querying deletion status ───────────────────────────
  if (deletionStatus === undefined) {
    return (
      <View style={styles.centerLoader}>
        <ActivityIndicator size="large" color={theme.colors.blue} />
      </View>
    );
  }

  // ── Change-of-mind state: pending request exists ───────────────────────────
  if (hasPendingRequest) {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={[
            styles.pendingBanner,
            {
              backgroundColor: 'rgba(34,197,94,0.08)',
              borderColor: 'rgba(34,197,94,0.35)',
            },
          ]}
        >
          <IconCircleCheck size={22} color="#16a34a" />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.pendingTitle}>Deletion Scheduled</Text>
            <Text
              style={[styles.pendingSubtext, { color: theme.colors.black }]}
            >
              Your account is scheduled for permanent deletion within 30 days of
              your request. You&apos;ve been signed out and can no longer use
              the app. If you change your mind, tap the button below.
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Button
            title={
              isCancelling ? 'Cancelling…' : 'Cancel Deletion — Keep My Account'
            }
            bg="#16a34a"
            disabled={isCancelling}
            onPress={handleCancelDeletion}
          />
        </View>
      </View>
    );
  }

  // ── Normal state: allow new deletion request ───────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      {/* Warning banner */}
      <View
        style={[
          styles.warningBanner,
          {
            backgroundColor: 'rgba(220, 38, 38, 0.08)',
            borderColor: 'rgba(220, 38, 38, 0.3)',
          },
        ]}
      >
        <IconAlertTriangle size={20} color="#DC2626" />
        <Text style={styles.warningText}>
          Deleting your account is permanent and cannot be undone. Your data
          will be erased within 30 days of your request.
        </Text>
      </View>

      {/* Reason textarea */}
      <View style={styles.textAreaContainer}>
        <Textarea
          label="Why are you deleting your account?"
          placeholder="Please share your reason so we can improve..."
          value={reason}
          onChangeText={setReason}
        />
      </View>

      {/* Delete button */}
      <View style={styles.footer}>
        <Button
          title={isSubmitting ? 'Submitting request…' : 'Delete My Account'}
          bg={'red'}
          color={'#fff'}
          disabled={isSubmitting}
          onPress={handleDelete}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  centerLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Change-of-mind / pending state
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  pendingTitle: {
    fontSize: 16,
    fontFamily: 'PublicSansBold',
    color: '#16a34a',
  },
  pendingSubtext: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'PublicSans',
  },
  // Normal delete form
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#DC2626',
    fontFamily: 'PublicSans',
  },
  subscriptionBlock: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subscriptionTitle: {
    fontSize: 15,
    fontFamily: 'PublicSansBold',
  },
  subscriptionSubtext: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'PublicSans',
  },
  cancelSubscriptionBtn: {
    marginTop: 4,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  cancelSubscriptionBtnText: {
    fontSize: 14,
    fontFamily: 'PublicSansBold',
  },
  textAreaContainer: {
    marginBottom: 24,
  },
  footer: {
    paddingBottom: 40,
  },
}));
