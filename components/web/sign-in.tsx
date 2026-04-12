import { Button } from '@/components/web/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/web/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/web/ui/form';
import { Input } from '@/components/web/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { toast } from 'sonner-native';

import { VerificationModal } from '@/features/admin/settings/components/verification-modal';
import { authClient } from '@/lib/auth-client';
import { Link, router } from 'expo-router';
import { useState } from 'react';

const SignInSchema = z.object({
  email: z.email({ error: 'Invalid email' }).min(1, 'Email is required'),
  password: z.string(),
});

type SignInValues = z.infer<typeof SignInSchema>;

export default function SignIn() {
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  async function onSubmit(values: SignInValues) {
    await authClient.signIn.email({
      email: values.email,
      password: values.password,
      fetchOptions: {
        onSuccess: async (context) => {
          if (context.data.twoFactorRedirect) {
            // Stay on this page — navigating away loses the temporary 2FA cookie
            // in cross-domain setups (convex.site ≠ localhost). Send OTP here
            // while the cookie is still valid in this request context.
            await authClient.twoFactor.sendOtp({
              fetchOptions: {
                onSuccess: () => {
                  setIsOTPModalOpen(true);
                  toast.success('Verification code sent', {
                    description: 'Please check your email.',
                  });
                },
                onError: ({ error }) => {
                  toast.error('Failed to send code', {
                    description: error.message || 'Please try again later.',
                  });
                },
              },
            });
          } else {
            toast.success('Signed in', {
              description: 'Welcome back',
            });
          }
        },
        onError: ({ error }) => {
          toast.error('Error', {
            description: error.message || error.statusText,
          });
        },
      },
    });
  }

  const onVerifyOTP = async () => {
    setIsVerifyingOTP(true);
    await authClient.twoFactor.verifyOtp({
      code: otpCode,
      trustDevice: true,
      fetchOptions: {
        onSuccess: () => {
          toast.success('Signed in successfully');
          setIsOTPModalOpen(false);
          setOtpCode('');
          form.reset();
          router.replace('/admin');
        },
        onError: ({ error }) => {
          toast.error('Verification failed', {
            description: error.message || 'Invalid code. Please try again.',
          });
        },
        onResponse: () => {
          setIsVerifyingOTP(false);
        },
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </Form>
          <Link
            href="/forgot-password"
            className="block text-center text-sm text-neutral-600 dark:text-neutral-400 mt-4"
          >
            Forgot Password?
          </Link>
        </CardContent>
      </Card>

      <VerificationModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        onVerify={onVerifyOTP}
        isVerifying={isVerifyingOTP}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        title="Two-Factor Authentication"
        description="We sent a 6-digit code to your email. Enter it below to complete sign-in."
      />
    </div>
  );
}
