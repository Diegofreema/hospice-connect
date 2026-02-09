import { api } from '@/convex/_generated/api';
import { useMutation, usePaginatedQuery } from 'convex/react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/web/ui/button';
import { Loader2 } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { ActivityNotificationFilters } from './activity-notification-filters';
import { ActivityNotificationRow } from './activity-notification-row';

type ActivityType =
  | 'all'
  | 'profile_update_request'
  | 'nurse_registration'
  | 'hospice_registration'
  | 'suspension_request'
  | 'deletion_request';
type ReadStatus = 'all' | 'read' | 'unread';

interface ActivityNotificationListProps {
  onNotificationClick?: (notification: any) => void;
}

export function ActivityNotificationList({
  onNotificationClick,
}: ActivityNotificationListProps) {
  const [activityType, setActivityType] = useState<ActivityType>('all');
  const [isRead, setIsRead] = useState<ReadStatus>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const markAllAsRead = useMutation(
    api.adminActivityNotifications.markAllActivityNotificationsAsRead,
  );
  const { results, status, loadMore, isLoading } = usePaginatedQuery(
    api.adminActivityNotifications.getAdminActivityNotifications,
    {
      isRead: isRead === 'all' ? undefined : isRead,
    },
    { initialNumItems: 15 },
  );

  const deleteNotification = useMutation(
    api.adminActivityNotifications.deleteActivityNotification,
  );
  const markAsRead = useMutation(
    api.adminActivityNotifications.markActivityNotificationAsRead,
  );

  const handleDelete = useCallback(
    async (notificationId: string) => {
      if (
        !confirm('Are you sure you want to delete this activity notification?')
      )
        return;

      setDeletingId(notificationId);
      try {
        await deleteNotification({ notificationId: notificationId as any });
        toast('Success', {
          description: 'Activity notification deleted successfully',
        });
      } catch (error) {
        toast.error('Error', {
          description: 'Failed to delete activity notification',
        });
      } finally {
        setDeletingId(null);
      }
    },
    [deleteNotification, toast],
  );

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await markAsRead({ notificationId: notificationId as any });
        toast.success('Success', {
          description: 'Marked as read',
        });
      } catch (error) {
        toast.error('Error', {
          description: 'Failed to mark as read',
        });
      }
    },
    [markAsRead, toast],
  );

  const hasActiveFilters = activityType !== 'all' || isRead !== 'all';

  const handleClearFilters = () => {
    setActivityType('all');
    setIsRead('all');
  };

  useEffect(() => {
    const handleMarkAllAsRead = async () => {
      await markAllAsRead({
        cursor: null,
        numItems: 100,
      });
    };
    if (status !== 'LoadingFirstPage' && results.length > 0) {
      handleMarkAllAsRead();
    }
  }, [markAllAsRead, results, status]);

  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">
          {hasActiveFilters
            ? 'No activities match your filters'
            : 'No activity notifications yet'}
        </p>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <ActivityNotificationFilters
        activityType={activityType}
        isRead={isRead}
        onActivityTypeChange={(type) => setActivityType(type as ActivityType)}
        onIsReadChange={(status) => setIsRead(status as ReadStatus)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Notifications List */}
      <div className="divide-y">
        {results.map((notification) => (
          <ActivityNotificationRow
            key={notification._id}
            notification={notification}
            onDelete={handleDelete}
            onMarkRead={handleMarkAsRead}
            onClick={() => onNotificationClick?.(notification)}
          />
        ))}
      </div>

      {/* Load More */}
      {status === 'CanLoadMore' && (
        <div className="p-4 border-t flex justify-center">
          <Button
            variant="outline"
            onClick={() => loadMore(10)}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Load More Activities
          </Button>
        </div>
      )}

      {status === 'Exhausted' && results.length > 0 && (
        <div className="p-4 border-t text-center text-sm text-muted-foreground">
          No more activities to load
        </div>
      )}
    </div>
  );
}
