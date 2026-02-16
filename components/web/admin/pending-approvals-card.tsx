'use client';

import { Badge } from '@/components/web/ui/badge';
import { Button } from '@/components/web/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/web/ui/card';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { Check, ChevronDown, ChevronUp, Clock, X } from 'lucide-react-native';
import { useState } from 'react';
import { toast } from 'sonner-native';
import { ApprovalType } from '../types';
import { RejectionDialog } from './rejection-dialog';

interface PendingApprovalsCardProps {
  pendingItems: ApprovalType[];
  type: 'nurse' | 'hospice';
  onRefresh: () => void;
}

export function PendingApprovalsCard({
  pendingItems,
  type,
  onRefresh,
}: PendingApprovalsCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ApprovalType | null>(null);

  const approveNurse = useMutation(api.adminNurses.approveNurse);
  const rejectNurse = useMutation(api.adminNurses.rejectNurse);
  const approveHospice = useMutation(api.adminHospices.approveHospice);
  const rejectHospice = useMutation(api.adminHospices.rejectHospice);

  const handleApprove = async (id: Id<'nurses'> | Id<'hospices'>) => {
    setLoading(true);
    try {
      if (type === 'nurse') {
        await approveNurse({
          pendingProfileId: id as Id<'nurses'>,
        });
      } else {
        await approveHospice({
          pendingProfileId: id as Id<'hospices'>,
        });
      }
      toast.success('Approved', {
        description: `The ${type} profile has been approved successfully.`,
      });
    } catch (error) {
      toast.error('Error', {
        description: `Failed to approve ${type} profile. Please try again.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = (item: ApprovalType) => {
    setSelectedItem(item);
    setRejectionDialogOpen(true);
  };

  const handleReject = async (rejectedReason: string) => {
    if (!selectedItem) return;

    setLoading(true);
    try {
      if (type === 'nurse') {
        await rejectNurse({
          pendingProfileId: selectedItem.id as Id<'nurses'>,
          rejectedReason,
        });
      } else {
        await rejectHospice({
          pendingProfileId: selectedItem.id as Id<'hospices'>,
          rejectedReason,
        });
      }
      toast.success('Rejected', {
        description: `The ${type} profile has been rejected.`,
      });
      onRefresh();
    } catch (error) {
      toast.error('Error', {
        description: `Failed to reject ${type} profile. Please try again.`,
      });
      throw error; // Re-throw to prevent dialog from closing
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="border-primary/20 bg-accent/5">
        <CardHeader
          className="cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>
                  {pendingItems.length} {type}{' '}
                  {pendingItems.length === 1 ? 'profile' : 'profiles'} awaiting
                  review
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              {expanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardHeader>
        {expanded && (
          <CardContent>
            <div className="space-y-3">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.name}</p>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.discipline ? `${item.discipline} - ` : ''}
                      {item.state}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(item.id)}
                      className="gap-1 bg-green-500"
                      disabled={loading}
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRejectClick(item)}
                      className="gap-1 bg-red-500"
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      <RejectionDialog
        open={rejectionDialogOpen}
        onOpenChange={setRejectionDialogOpen}
        onReject={handleReject}
        type={type}
        loading={loading}
        itemName={selectedItem?.name}
      />
    </>
  );
}
