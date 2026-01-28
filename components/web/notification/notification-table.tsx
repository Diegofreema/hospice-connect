'use client';

import { LoadingComponent } from '@/components/loading-component';
import { Button } from '@/components/ui/button';
import { api } from '@hospice-2/backend/convex/_generated/api';
import { useMutation, usePaginatedQuery } from 'convex/react';
import { LoaderCircle } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { NotificationFilters } from './notification-filters';
import { NotificationRow } from './notification-row';

type NotificationType = 'all' | 'notification' | 'news_alert' | 'announcement';
type ReadStatus = 'all' | 'read' | 'unread';

interface NotificationTableProps {
  onNotificationClick: (messageId: string) => void;
}

export function NotificationTable({
  onNotificationClick,
}: NotificationTableProps) {
  const [isRead, setIsRead] = useState<ReadStatus>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // const [targetType, setTargetType] = useState<NotificationType>('all');
  const { results, status, loadMore } = usePaginatedQuery(
    api.notifications.getAdminNotifications,
    {
      isRead,
    },
    { initialNumItems: 25 },
  );

  const deleteNotification = useMutation(
    api.notifications.deleteAdminNotification,
  );

  const handleDelete = useCallback(
    async (messageId: string) => {
      if (!confirm('Are you sure you want to delete this notification?'))
        return;

      setDeletingId(messageId);
      try {
        await deleteNotification({ messageId: messageId as any });
        toast('Success', {
          description: 'Notification deleted successfully',
        });
      } catch (error) {
        console.error('Failed to delete notification:', error);
        toast('Error', {
          description: 'Failed to delete notification',
        });
      } finally {
        setDeletingId(null);
      }
    },
    [deleteNotification, toast],
  );

  if (status === 'LoadingFirstPage') {
    return <LoadingComponent />;
  }

  const onLoadMore = () => {
    if (status === 'CanLoadMore') {
      loadMore(20);
    }
  };
  console.log(results);

  return (
    <div className="space-y-4">
      <NotificationFilters isRead={isRead} onReadStatusChange={setIsRead} />

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No notifications found
                  </td>
                </tr>
              ) : (
                results.map((notification) => (
                  <NotificationRow
                    key={notification._id}
                    id={notification._id}
                    title={notification.title}
                    type={notification.type}
                    sentDate={notification._creationTime}
                    onView={() => onNotificationClick(notification._id)}
                    onDelete={() => handleDelete(notification._id)}
                    isDeleting={deletingId === notification._id}
                    name={notification.name}
                    email={notification.email}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={status === 'LoadingMore' || status !== 'CanLoadMore'}
            onClick={onLoadMore}
          >
            Load more
            {status === 'LoadingMore' && (
              <LoaderCircle className="h-4 w-4 mr-1 animate-spin" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
