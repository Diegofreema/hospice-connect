'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DeletionStatusDisplayProps {
  status: 'pending' | 'completed' | 'cancelled';
  requestedAt: number;
  onCancel?: () => void;
  isCanceling?: boolean;
}

export function DeletionStatusDisplay({
  status,
  requestedAt,
  onCancel,
  isCanceling = false,
}: DeletionStatusDisplayProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-neutral-600';
      default:
        return 'text-neutral-600';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'completed':
        return 'Account Deleted';
      case 'pending':
        return 'Pending Deletion';
      case 'cancelled':
        return 'Deletion Cancelled';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className={`h-6 w-6 ${getStatusColor()}`} />;
      case 'pending':
        return <Clock className={`h-6 w-6 ${getStatusColor()}`} />;
      case 'cancelled':
        return <CheckCircle2 className={`h-6 w-6 ${getStatusColor()}`} />;
      default:
        return null;
    }
  };

  return (
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusMessage()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-neutral-600">
            {status === 'pending' &&
              `Request submitted ${formatDistanceToNow(requestedAt, { addSuffix: true })}`}
            {status === 'completed' &&
              `Account permanently deleted ${formatDistanceToNow(requestedAt, { addSuffix: true })}`}
            {status === 'cancelled' &&
              `Deletion cancelled ${formatDistanceToNow(requestedAt, { addSuffix: true })}`}
          </p>
        </div>

        {status === 'pending' && (
          <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
            <p className="text-xs text-blue-700">
              Your account will be permanently deleted in 30 days. You can
              cancel this request at any time until then.
            </p>
          </div>
        )}

        {status === 'pending' && onCancel && (
          <Button
            onClick={onCancel}
            disabled={isCanceling}
            variant="outline"
            className="w-full bg-transparent"
          >
            {isCanceling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Cancel Deletion Request'
            )}
          </Button>
        )}

        {status === 'completed' && (
          <div className="rounded-lg bg-green-50 p-3 border border-green-100">
            <p className="text-xs text-green-700">
              Your account and all associated data have been permanently
              deleted. If you wish to use our service again, you will need to
              create a new account.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
