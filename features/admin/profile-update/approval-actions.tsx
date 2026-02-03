import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/web/ui/alert-dialog';
import { Button } from '@/components/web/ui/button';
import { Textarea } from '@/components/web/ui/textarea';
import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { toast } from 'sonner-native';

interface ApprovalActionsProps {
  name: string;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function ApprovalActions({
  name,
  onApprove,
  onReject,
  isLoading = false,
}: ApprovalActionsProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await onApprove();
      toast.success(`Profile update for ${name} approved successfully.`);
    } catch (error) {
      toast.error(`Failed to approve profile update. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onReject(rejectionReason);
      toast.success(`Profile update for ${name} rejected.`);
      setShowRejectDialog(false);
      setRejectionReason('');
    } catch (error) {
      toast.error(`Failed to reject profile update. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={handleApprove}
          disabled={isLoading || isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="w-4 h-4 mr-2" />
          Approve
        </Button>
        <Button
          onClick={() => setShowRejectDialog(true)}
          disabled={isLoading || isSubmitting}
          variant="destructive"
        >
          <X className="w-4 h-4 mr-2" />
          Reject
        </Button>
      </div>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Profile Update</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this profile update. The
              user will be notified about the rejection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-24"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isSubmitting || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Rejecting...' : 'Reject'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
