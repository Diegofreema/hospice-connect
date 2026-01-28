'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';

interface DeletionActionButtonsProps {
  isLoading: boolean;
  isConfirmed: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function DeletionActionButtons({
  isLoading,
  isConfirmed,
  onSubmit,
  onCancel,
}: DeletionActionButtonsProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (showConfirmation) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Final Confirmation</h3>
            <p className="text-sm text-red-800 mt-1">
              This will submit your account deletion request. You'll have 30
              days to cancel before permanent deletion.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setShowConfirmation(false)}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Go Back
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Delete Account
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Button
        onClick={onCancel}
        variant="outline"
        className="flex-1 bg-transparent"
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        onClick={() => setShowConfirmation(true)}
        disabled={!isConfirmed || isLoading}
        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Request Account Deletion
          </>
        )}
      </Button>
    </div>
  );
}
