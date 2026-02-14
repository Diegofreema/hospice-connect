import { Badge } from '@/components/web/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/web/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { Clock, User } from 'lucide-react-native';
import { ActivityNotification } from '../types';

interface ActivityNotificationDetailsProps {
  notification: ActivityNotification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const activityTypeConfig: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  profile_update_request: {
    label: 'Profile Update Request',
    variant: 'secondary',
  },
  nurse_registration: {
    label: 'Nurse Registration',
    variant: 'default',
  },
  hospice_registration: {
    label: 'Hospice Registration',
    variant: 'default',
  },
  suspension_request: {
    label: 'Suspension Request',
    variant: 'destructive',
  },
  deletion_request: {
    label: 'Deletion Request',
    variant: 'destructive',
  },
};

export function ActivityNotificationDetails({
  notification,
  open,
  onOpenChange,
}: ActivityNotificationDetailsProps) {
  if (!notification) return null;

  const config = activityTypeConfig[notification.type] || {
    label: 'Activity',
    variant: 'outline' as const,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <DialogTitle>{notification.title}</DialogTitle>
              <DialogDescription className="mt-2">
                {notification.description}
              </DialogDescription>
            </div>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata Section */}
          <div className="grid gap-4">
            {/* Triggered By */}
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <User className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Triggered by</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.relatedEntity
                    ? 'businessName' in notification.relatedEntity
                      ? notification.relatedEntity.businessName
                      : 'name' in notification.relatedEntity
                        ? notification.relatedEntity.name
                        : 'Unknown user'
                    : 'Unknown user'}
                </p>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification._creationTime), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {/* Metadata Details */}
            {notification.metadata &&
              Object.keys(notification.metadata).length > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Additional Details</p>
                  <div className="space-y-2">
                    {Object.entries(notification.metadata).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-start gap-2"
                        >
                          <span className="text-sm text-muted-foreground capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="text-sm font-medium text-right">
                            {String(value)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Read Status */}
          <div className="text-xs text-muted-foreground text-center">
            {notification.isRead ? '✓ Read' : 'Unread'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
