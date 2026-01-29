import { useState } from 'react';

import { ForgotPasswordForm } from '@/components/web/forgot-password-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/web/ui/card';
import { Link } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Reset Password
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Enter your email to receive password reset instructions
          </p>
        </div>

        {/* Form Card */}
        <Card className="border border-neutral-200 dark:border-neutral-800 shadow-lg">
          <CardHeader className="border-b border-neutral-200 dark:border-neutral-800">
            <CardTitle>Forgot your password?</CardTitle>
            <CardDescription>
              We'll send you an email with a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isSubmitted ? (
              <div className="space-y-4 text-center">
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Check your email for reset instructions
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    If you don't see the email, check your spam folder
                  </p>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  The reset link will expire in 24 hours
                </p>
              </div>
            ) : (
              <ForgotPasswordForm onSuccess={() => setIsSubmitted(true)} />
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
