import { authClient } from '@/lib/auth-client';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/web/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/web/ui/card';
import { Checkbox } from '@/components/web/ui/checkbox';
import { VerificationContent } from '@/features/admin/settings/components/verification-modal';
import { useRouter } from 'expo-router';
import { Loader2, RefreshCw, ShieldAlert } from 'lucide-react-native';
import { toast } from 'sonner-native';

const Verify2fa = () => {
  const router = useRouter();
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [trustDevice, setTrustDevice] = useState(true);

  const handleOtpSend = async () => {
    setIsSending(true);
    await authClient.twoFactor.sendOtp({
      fetchOptions: {
        onSuccess: () => {
          setOtpSent(true);
          toast.success('Verification code sent', {
            description: 'Please check your email.',
          });
        },
        onError: ({ error }) => {
          toast.error('Failed to send code', {
            description: error.message || 'Please try again later.',
          });
        },
        onResponse: () => {
          setIsSending(false);
        },
      },
    });
  };

  // Automatically send OTP on mount

  useEffect(() => {
    handleOtpSend();
  }, []);

  const handleOtpVerify = async () => {
    if (otpCode.length !== 6) return;

    await authClient.twoFactor.verifyOtp({
      code: otpCode,
      trustDevice,
      fetchOptions: {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          toast.success('Verified successfully', {
            description: 'Access granted.',
          });
          router.replace('/admin');
        },
        onError: ({ error }) => {
          toast.error('Verification failed', {
            description: error.message || 'The code entered is invalid.',
          });
        },
        onResponse: () => {
          setLoading(false);
        },
      },
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4  relative overflow-hidden">
      {/* Premium Mesh Background Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />

      <Card className="w-full max-w-[440px] shadow-2xl border-neutral-200/50  bg-white/80  z-10 transition-all duration-300">
        <CardHeader className="space-y-1 pb-6 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-50  rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
            <ShieldAlert className="w-6 h-6 text-blue-600 " />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Security Check
          </CardTitle>
          <CardDescription className="text-neutral-500 ">
            Two-factor authentication is enabled for your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <VerificationContent
            onVerify={handleOtpVerify}
            isVerifying={loading}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            title=""
            description="Enter the 6-digit code sent to your email to verify your identity."
          />

          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-2 px-1">
              <Checkbox
                id="trustDevice"
                checked={trustDevice}
                onCheckedChange={(checked) => setTrustDevice(checked === true)}
              />
              <label
                htmlFor="trustDevice"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-neutral-600 "
              >
                Trust this device for 30 days
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="w-full text-xs text-neutral-500 hover:text-neutral-900  h-8 font-medium transition-colors"
                onClick={handleOtpSend}
                disabled={isSending || loading}
              >
                {isSending ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-2" />
                )}
                Didn&apos;t receive a code? Resend
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify2fa;
