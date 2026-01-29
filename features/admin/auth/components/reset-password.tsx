import { useState } from 'react';

import { ResetPasswordForm } from '@/components/web/admin/reset-passowrd';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/web/ui/card';
import { Link } from 'expo-router';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';

type Props = {
  token: string;
};

export function ResetPassword({ token }: Props) {
  const [isResetComplete, setIsResetComplete] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg md:text-xl">Invalid Link</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              This password reset link is invalid or has expired. Please request
              a new one.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Set New Password
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Create a strong password for your account
          </p>
        </div>

        {/* Form Card */}
        <Card className="border border-neutral-200 dark:border-neutral-800 shadow-lg">
          <CardHeader className="border-b border-neutral-200 dark:border-neutral-800"></CardHeader>
          <CardContent className="pt-6">
            {isResetComplete ? (
              <div className="space-y-4 text-center">
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Password Reset Successful
                  </p>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Your password has been reset. You can now log in with your new
                  password.
                </p>
                <Link
                  href="/admin"
                  className="inline-block mt-4 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors text-sm font-medium"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <ResetPasswordForm
                token={token}
                onSuccess={() => setIsResetComplete(true)}
              />
            )}
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
