'use client';

import { Button } from '@/components/web/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/web/ui/dialog';
import { Label } from '@/components/web/ui/label';
import { Textarea } from '@/components/web/ui/textarea';
import { useState } from 'react';

interface RejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (reason: string) => Promise<void>;
  type: 'nurse' | 'hospice';
  loading: boolean;
  itemName?: string;
}

export function RejectionDialog({
  open,
  onOpenChange,
  onReject,
  type,
  loading,
  itemName,
}: RejectionDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleReject = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      await onReject(reason.trim());
      setReason('');
      setError('');
      onOpenChange(false);
    } catch (err) {
      // Error handling is done in parent component
      console.error(err);
    }
  };

  const handleCancel = () => {
    setReason('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            Reject {type === 'nurse' ? 'Healthcare Professional' : 'Hospice'}
          </DialogTitle>
          <DialogDescription>
            {itemName && `Rejecting: ${itemName}. `}
            Please provide a reason for rejecting this {type} application. This
            will be stored for record-keeping purposes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rejection-reason">
              Rejection Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder={`e.g., Invalid license credentials, Missing required documents, etc.`}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              className="min-h-[120px]"
              disabled={loading}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleReject}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600"
          >
            {loading ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
