'use client';

import { Badge } from '@/components/web/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/web/ui/dialog';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Loader2 } from 'lucide-react-native';

interface NotificationDetailsDialogProps {
  messageId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationDetailsDialog({
  messageId,
  open,
  onOpenChange,
}: NotificationDetailsDialogProps) {
  const notification = useQuery(
    api.notifications.getNotificationDetails,
    messageId ? { messageId: messageId as Id<'adminNotifications'> } : 'skip',
  );

  if (!messageId) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'nurse':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'hospice':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';

      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const getTargetLabel = (target: string) => {
    const labels: Record<string, string> = {
      all_nurses: 'All Nurses',
      all_hospices: 'All Hospices',
      by_state: 'By State',
      by_discipline: 'By Discipline',
      selected_nurses: 'Selected Nurses',
      selected_hospices: 'Selected Hospices',
    };
    return labels[target] || target;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge className={getTypeColor(notification?.type || 'nurse')}>
              {notification?.type}
            </Badge>
            {notification?.title}
          </DialogTitle>
          <DialogDescription>
            {getTargetLabel(notification?.description || '')}
          </DialogDescription>
        </DialogHeader>

        {!notification ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Sender Info */}
            <div className="space-y-2 bg-muted p-3 rounded-lg">
              <p className="text-xs font-medium">SENT BY</p>
              <p className="text-sm font-medium">
                {notification.sender?.name || notification.sender?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(notification._creationTime).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
