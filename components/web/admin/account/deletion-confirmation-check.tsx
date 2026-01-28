'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface DeletionConfirmationCheckProps {
  onConfirmationChange: (confirmed: boolean) => void;
}

export function DeletionConfirmationCheck({
  onConfirmationChange,
}: DeletionConfirmationCheckProps) {
  return (
    <div className="space-y-3 rounded-lg bg-red-50 border border-red-200 p-4">
      <div className="flex items-start gap-3">
        <Checkbox
          id="confirm-deletion"
          onCheckedChange={(checked) => onConfirmationChange(checked === true)}
          className="mt-1"
        />
        <Label
          htmlFor="confirm-deletion"
          className="text-sm text-neutral-700 cursor-pointer font-medium leading-relaxed"
        >
          I understand that deleting my account will permanently remove all my
          data and this action cannot be undone
        </Label>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="confirm-aware"
          onCheckedChange={(checked) => onConfirmationChange(checked === true)}
          className="mt-1"
        />
        <Label
          htmlFor="confirm-aware"
          className="text-sm text-neutral-700 cursor-pointer font-medium leading-relaxed"
        >
          I am aware I will not be able to recover my account after the 30-day
          grace period
        </Label>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="confirm-email"
          onCheckedChange={(checked) => onConfirmationChange(checked === true)}
          className="mt-1"
        />
        <Label
          htmlFor="confirm-email"
          className="text-sm text-neutral-700 cursor-pointer font-medium leading-relaxed"
        >
          I confirm that I want to proceed with account deletion
        </Label>
      </div>
    </div>
  );
}
