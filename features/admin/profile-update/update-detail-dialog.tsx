'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/web/ui/dialog';
import { ScrollArea } from '@/components/web/ui/scroll-area';
import { api } from '@/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';

import type { Doc, Id } from '@/convex/_generated/dataModel';
import { generateErrorMessage } from '@/features/shared/utils';
import { toast } from 'sonner-native';
import { ApprovalActions } from './approval-actions';
import { HospiceUpdateComparison } from './hospice-update-comparision';
import { NurseUpdateComparison } from './nurse-update-comparision';

interface UpdateDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  updateIdNurse?: Id<'pendingNurseProfile'>;
  updateIdHospice?: Id<'pendingHospiceProfile'>;
  type: 'nurse' | 'hospice';
  onApprovalComplete: () => void;
}

export function UpdateDetailsDialog({
  isOpen,
  onOpenChange,
  updateIdNurse,
  updateIdHospice,
  type,
  onApprovalComplete,
}: UpdateDetailsDialogProps) {
  const updateDetailsNurse = useQuery(
    api.profileUpdates.getNurseUpdateDetails,
    updateIdNurse ? { pendingProfileId: updateIdNurse } : 'skip',
  );
  const updateDetailsHospice = useQuery(
    api.profileUpdates.getHospiceUpdateDetails,
    updateIdHospice ? { pendingProfileId: updateIdHospice } : 'skip',
  );

  const approveNurseUpdate = useMutation(api.profileUpdates.approveNurseUpdate);
  const rejectNurseUpdate = useMutation(api.profileUpdates.rejectNurseUpdate);
  const approveHospiceUpdate = useMutation(
    api.profileUpdates.approveHospiceUpdate,
  );
  const rejectHospiceUpdate = useMutation(
    api.profileUpdates.rejectHospiceUpdate,
  );

  const handleApprove = async () => {
    if (!updateIdNurse && !updateIdHospice) return;

    try {
      if (type === 'nurse') {
        await approveNurseUpdate({
          pendingProfileId: updateIdNurse as Id<'pendingNurseProfile'>,
        });
      } else {
        await approveHospiceUpdate({
          pendingProfileId: updateIdHospice as Id<'pendingHospiceProfile'>,
        });
      }
      onOpenChange(false);
      onApprovalComplete();
      toast.success('Profile update approved successfully');
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to reject profile update',
      );
      toast.error('Error', {
        description: errorMessage,
      });
    }
  };

  const handleReject = async (reason: string) => {
    if (!updateIdNurse && !updateIdHospice) return;

    try {
      if (type === 'nurse') {
        await rejectNurseUpdate({
          pendingProfileId: updateIdNurse as Id<'pendingNurseProfile'>,
          reason,
        });
      } else {
        await rejectHospiceUpdate({
          pendingProfileId: updateIdHospice as Id<'pendingHospiceProfile'>,
          reason,
        });
      }
      onOpenChange(false);
      onApprovalComplete();
      toast.success('Profile update rejected successfully');
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to reject profile update',
      );
      toast.error('Error', {
        description: errorMessage,
      });
    }
  };

  const updateDetails =
    type === 'nurse' ? updateDetailsNurse : updateDetailsHospice;

  if (!updateDetails) {
    return null;
  }

  const name =
    type === 'nurse'
      ? `${(updateDetails.pendingProfile as Doc<'pendingNurseProfile'>).firstName} ${(updateDetails.pendingProfile as Doc<'pendingNurseProfile'>).lastName}`
      : (updateDetails.pendingProfile as Doc<'pendingHospiceProfile'>)
          .businessName;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {type === 'nurse' ? 'Nurse' : 'Hospice'} Profile Update
          </DialogTitle>
          <DialogDescription>
            Reviewing profile update request from {name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
          <div className="space-y-6 py-4">
            {type === 'nurse' ? (
              <NurseUpdateComparison
                currentProfile={
                  updateDetails.currentProfile as Doc<'nurses'> | null
                }
                pendingProfile={
                  updateDetails.pendingProfile as Doc<'pendingNurseProfile'>
                }
              />
            ) : (
              <HospiceUpdateComparison
                currentProfile={
                  updateDetails.currentProfile as Doc<'hospices'> | null
                }
                pendingProfile={
                  updateDetails.pendingProfile as Doc<'pendingHospiceProfile'>
                }
              />
            )}
          </div>
        </ScrollArea>

        <div className="border-t pt-4 flex justify-end gap-2">
          <ApprovalActions
            name={name}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
