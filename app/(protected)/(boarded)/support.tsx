import { api } from '@/convex/_generated/api';
import { ControlInput } from '@/features/authentication/components/form/control-input';
import { Button } from '@/features/shared/components/button';
import { Text } from '@/features/shared/components/text';
import { Wrapper } from '@/features/shared/components/wrapper';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowLeft, IconSend } from '@tabler/icons-react-native';
import { useAction } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { toast } from 'sonner-native';
import { z } from 'zod';

const supportSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type SupportFormValues = z.infer<typeof supportSchema>;

const SupportScreen = () => {
  const { theme } = useUnistyles();
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const [submitting, setSubmitting] = useState(false);

  const submitTicket = useAction(api.support.submitSupportTicket);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: SupportFormValues) => {
    setSubmitting(true);
    try {
      await submitTicket({
        subject: data.subject,
        message: data.message,
      });
      toast.success('Success', {
        description: 'Your support message has been sent to the admin.',
      });
      reset();
      router.back();
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to send support message. Please try again.',
      });
      console.error('Support submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Wrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.colors.greyLight }]}
          hitSlop={8}
        >
          <IconArrowLeft
            size={18}
            color={theme.colors.typography}
            strokeWidth={2.2}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.introSection}>
            <Text size="large" isBold>
              Contact Support
            </Text>
            <Text color={theme.colors.textGrey} style={styles.introDesc}>
              Have a question or feedback? Send us a message and our team will
              get back to you as soon as possible.
            </Text>
          </View>

          {/* Support Form */}
          <View style={styles.formContainer}>
            <ControlInput
              control={control}
              name="subject"
              label="Subject"
              placeholder="What can we help you with?"
              errors={errors}
            />

            <View style={{ marginTop: 8 }}>
              <ControlInput
                control={control}
                name="message"
                label="Message"
                placeholder="Describe your issue or feedback in detail..."
                variant="textarea"
                errors={errors}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: bottom + 16,
            borderTopColor: theme.colors.greyLight,
          },
        ]}
      >
        <Button
          title={submitting ? 'Sending...' : 'Send Message'}
          onPress={handleSubmit(onSubmit)}
          disabled={submitting || !isValid}
          icon={submitting ? undefined : IconSend}
          rightIcon={
            submitting ? (
              <ActivityIndicator color="#fff" style={{ marginLeft: 8 }} />
            ) : undefined
          }
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create((theme) => ({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: theme.fontFamily.bold,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
    gap: 24,
  },
  introSection: {
    gap: 8,
  },
  introDesc: {
    lineHeight: 20,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
  },
  infoRow: {
    gap: 2,
  },
  formContainer: {
    gap: 16,
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
  },
}));

export default SupportScreen;
