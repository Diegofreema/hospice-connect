'use client';

import { Badge } from '@/components/web/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/web/ui/dialog';
import { Separator } from '@/components/web/ui/separator';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import {
  generateStatusColorAndBackgroundColor,
  generateStatusText,
} from '@/lib/utils';
import { useQuery } from 'convex/react';
import { format } from 'date-fns';
import { Mail, MapPin, Phone } from 'lucide-react-native';

interface NurseDetailsDialogProps {
  nurseId: Id<'nurses'>;
  open: boolean;
  onClose: () => void;
}

export function NurseDetailsDialog({
  nurseId,
  open,
  onClose,
}: NurseDetailsDialogProps) {
  const nurse = useQuery(api.adminNurses.getNurse, { nurseId });

  if (!nurse) return null;

  const isApproved = nurse.status === 'approved';
  const isSuspended = nurse.status === 'suspended';
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{nurse.name}</DialogTitle>
          <DialogDescription>Nurse Profile Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge
              className={generateStatusColorAndBackgroundColor(nurse.status)}
            >
              {generateStatusText(nurse.status)}
            </Badge>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{nurse?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{nurse?.phoneNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {nurse.stateOfRegistration} {nurse.zipCode}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Professional Information */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">
              Professional Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Discipline</p>
                <p className="font-medium">{nurse.discipline}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">License Number</p>
                <p className="font-medium">{nurse.licenseNumber}</p>
              </div>
            </div>
          </div>

          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2 text-lg">Address</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {nurse.address}
              </p>
            </div>
          </>

          <Separator />

          {/* Account Details */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Account Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">
                  {format(new Date(nurse._creationTime), 'MM/dd/yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
