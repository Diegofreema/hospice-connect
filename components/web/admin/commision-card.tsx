'use client';

import React from 'react';

import { api } from '@/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';

import { useAuth } from '@/components/context/auth';
import { Button } from '@/components/web/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/web/ui/card';
import { Input } from '@/components/web/ui/input';
import { Label } from '@/components/web/ui/label';
import { generateErrorMessage } from '@/features/shared/utils';
import { DollarSign, Loader2 } from 'lucide-react-native';

export function CommissionCard() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [commission, setCommission] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const updateCommission = useMutation(api.adminSettings.updateAdminCommission);
  const commissionQuery = useQuery(api.adminSettings.getCommission);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const commissionValue = Number.parseFloat(commission);

    if (
      isNaN(commissionValue) ||
      commissionValue < 0 ||
      commissionValue > 100
    ) {
      setMessage({
        type: 'error',
        text: 'Commission must be between 0 and 100',
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await updateCommission({
        commissionPercentage: commissionValue,
      });

      setMessage({ type: 'success', text: 'Commission updated successfully' });
      setIsEditing(false);
      setCommission('');
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to update commission',
      );
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (commissionQuery === undefined) {
    return null;
  }

  return (
    <Card className="border border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Commission Settings
        </CardTitle>
        <CardDescription>Manage your commission percentage</CardDescription>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide">
                Current Commission
              </Label>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {commissionQuery ? `${commissionQuery}%` : 'Not set'}
              </p>
            </div>
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Edit Commission
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="commission"
                className="text-xs font-semibold uppercase tracking-wide"
              >
                Commission Percentage
              </Label>
              <div className="relative">
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  placeholder="Enter commission percentage"
                  className="border border-neutral-200 dark:border-neutral-800"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400">
                  %
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Enter a value between 0 and 100
              </p>
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

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
