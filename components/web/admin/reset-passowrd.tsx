'use client';

import type React from 'react';

import { Button } from '@/components/web/ui/button';
import { Input } from '@/components/web/ui/input';
import { Label } from '@/components/web/ui/label';
import { authClient } from '@/lib/auth-client';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { toast } from 'sonner-native';

interface ResetPasswordFormProps {
  token: string;
  onSuccess?: () => void;
}

export function ResetPasswordForm({
  token,
  onSuccess,
}: ResetPasswordFormProps) {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Both password fields are required' });
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setMessage({ type: 'error', text: passwordError });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    await authClient.resetPassword({
      token,
      newPassword: formData.password,
      fetchOptions: {
        onRequest: () => {
          setIsLoading(true);
          setMessage(null);
        },
        onSuccess: () => {
          setMessage({
            type: 'success',
            text: 'Password reset successfully',
          });
          onSuccess?.();
          toast.success('Password reset successfully');
        },
        onError: ({ error }) => {
          setMessage({
            type: 'error',
            text:
              error instanceof Error
                ? error.message
                : 'Failed to reset password',
          });
          setIsLoading(false);
          toast.error('Error', {
            description: error.message || error.statusText,
          });
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-xs font-semibold uppercase tracking-wide"
        >
          New Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPasswords.password ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Enter new password"
            className="border border-neutral-200 dark:border-neutral-800 pl-10 pr-10"
            disabled={isLoading}
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <button
            type="button"
            onClick={() =>
              setShowPasswords({
                ...showPasswords,
                password: !showPasswords.password,
              })
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            {showPasswords.password ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="confirm-password"
          className="text-xs font-semibold uppercase tracking-wide"
        >
          Confirm Password
        </Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            placeholder="Confirm new password"
            className="border border-neutral-200 dark:border-neutral-800 pl-10 pr-10"
            disabled={isLoading}
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <button
            type="button"
            onClick={() =>
              setShowPasswords({
                ...showPasswords,
                confirm: !showPasswords.confirm,
              })
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            {showPasswords.confirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="bg-neutral-50 dark:bg-neutral-900 rounded-md p-3 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
        <p className="font-medium text-neutral-700 dark:text-neutral-300">
          Password requirements:
        </p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>At least 8 characters long</li>
          <li>At least one uppercase letter</li>
          <li>At least one number</li>
        </ul>
      </div>

      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Resetting...
          </>
        ) : (
          'Reset Password'
        )}
      </Button>
    </form>
  );
}
