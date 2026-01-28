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
import { useQuery } from 'convex/react';
import { FileText, Mail, MapPin, Phone } from 'lucide-react-native';

interface HospiceDetailsDialogProps {
  hospiceId: Id<'hospices'>;
  open: boolean;
  onClose: () => void;
}

export function HospiceDetailsDialog({
  hospiceId,
  open,
  onClose,
}: HospiceDetailsDialogProps) {
  const hospice = useQuery(api.adminHospices.getHospice, { hospiceId });

  if (!hospice) return null;
  const isApproved = hospice.status === 'approved';
  const isSuspended = hospice.status === 'suspended';
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{hospice.businessName}</DialogTitle>
          <DialogDescription>Hospice Profile Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-2">
            {isSuspended ? (
              <Badge variant="destructive">Suspended</Badge>
            ) : isApproved ? (
              <Badge variant="default">Approved</Badge>
            ) : (
              <Badge variant="secondary">Pending</Badge>
            )}
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{hospice.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{hospice.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {hospice.address}, {hospice.state} {hospice.zipcode}
                </span>
              </div>
              {/* {hospice.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={hospice.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {hospice.website}
                  </a>
                </div>
              )} */}
            </div>
          </div>

          <Separator />

          {/* License Information */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">License Information</h3>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>
                License Number:{' '}
                <span className="font-medium">{hospice.licenseNumber}</span>
              </span>
            </div>
          </div>

          {/* Description */}
          {/* {hospice. && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2 text-lg">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{hospice.description}</p>
              </div>
            </>
          )} */}

          <Separator />

          {/* Account Details */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Account Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(hospice._creationTime).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
