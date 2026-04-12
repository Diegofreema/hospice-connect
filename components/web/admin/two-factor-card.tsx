import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LoaderCircle, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAuth } from '@/components/context/auth';
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
import { VerificationModal } from '@/features/admin/settings/components/verification-modal';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner-native';

const TwoFactorSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

type TwoFactorValues = z.infer<typeof TwoFactorSchema>;

export function TwoFactorCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const { user } = useAuth();
  const isTwoFactorEnabled = user?.twoFactorEnabled;

  const form = useForm<TwoFactorValues>({
    resolver: zodResolver(TwoFactorSchema),
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = async (values: TwoFactorValues) => {
    if (isTwoFactorEnabled) {
      // Disabling 2FA
      await authClient.twoFactor.disable({
        password: values.password,
        fetchOptions: {
          onSuccess: () => {
            toast.success('Two-factor authentication disabled');
            form.reset();
          },
          onError: ({ error }) => {
            toast.error('Failed to disable 2FA', {
              description: error.message || 'An unexpected error occurred.',
            });
          },
        },
      });
    } else {
      // Enabling 2FA
      await authClient.twoFactor.enable({
        password: values.password,
        issuer: 'HospiceConnect',
        fetchOptions: {
          onSuccess: async () => {
            // Success code here is triggered when password is correct and 2FA is "initiated"
            // Now we send the OTP
            await authClient.twoFactor.sendOtp({
              fetchOptions: {
                onSuccess: () => {
                  toast.success('OTP sent to your email');
                  setIsOTPModalOpen(true);
                },
                onError: ({ error }) => {
                  toast.error('Failed to send OTP', {
                    description: error.message,
                  });
                },
              },
            });
          },
          onError: ({ error }) => {
            toast.error('Failed to verify password', {
              description: error.message || 'An unexpected error occurred.',
            });
          },
        },
      });
    }
  };

  const onVerifyOTP = async () => {
    setIsVerifyingOTP(true);
    await authClient.twoFactor.verifyOtp({
      code: otpCode,

      fetchOptions: {
        onSuccess: async () => {
          toast.success(
            'Two-factor authentication enabled successfully, Please login again',
          );
          setIsOTPModalOpen(false);
          setOtpCode('');
          form.reset();
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
    <>
      <Card className="border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck
              className={cn(
                'h-5 w-5',
                isTwoFactorEnabled ? 'text-green-500' : 'text-neutral-500',
              )}
            />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            {isTwoFactorEnabled
              ? 'Your account is currently protected with an extra layer of security.'
              : 'Add an extra layer of security to your account using industry-standard OTP verification.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-semibold uppercase tracking-wide">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={
                            isTwoFactorEnabled
                              ? 'Enter password to disable 2FA'
                              : 'Enter password to enable 2FA'
                          }
                          className="border border-neutral-200 dark:border-neutral-800 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className={cn(
                  'w-full',
                  isTwoFactorEnabled
                    ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                    : 'bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200',
                )}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    {isTwoFactorEnabled ? 'Disabling...' : 'Enabling...'}
                  </>
                ) : isTwoFactorEnabled ? (
                  'Disable Two-Factor Authentication'
                ) : (
                  'Enable Two-Factor Authentication'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <VerificationModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        onVerify={onVerifyOTP}
        isVerifying={isVerifyingOTP}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
      />
    </>
  );
}
