'use client';

import React from 'react';

import { Button } from '@/components/web/ui/button';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';
import { FunctionReturnType } from 'convex/server';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  Trash2,
  User,
} from 'lucide-react-native';

interface ActivityNotificationRowProps {
  notification: FunctionReturnType<
    typeof api.adminActivityNotifications.getAdminActivityNotifications
  >['page'][number];
  onDelete: (id: string) => void;
  onMarkRead?: (id: string) => void;
  onClick?: () => void;
}

const activityTypeConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  profile_update_request: {
    label: 'Profile Update',
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'text-blue-600',
  },
  nurse_registration: {
    label: 'Nurse Registration',
    icon: <User className="h-4 w-4" />,
    color: 'text-green-600',
  },
  hospice_registration: {
    label: 'Hospice Registration',
    icon: <Building2 className="h-4 w-4" />,
    color: 'text-purple-600',
  },
  suspension_request: {
    label: 'Suspension Request',
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'text-red-600',
  },
  deletion_request: {
    label: 'Deletion Request',
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'text-orange-600',
  },
};

export function ActivityNotificationRow({
  notification,
  onDelete,
  onMarkRead,
  onClick,
}: ActivityNotificationRowProps) {
  // Derive visual config based on title and type
  const getConfigKey = () => {
    const title = notification.title.toLowerCase();

    if (title.includes('profile update')) return 'profile_update_request';
    if (title.includes('registration')) {
      return notification.type === 'nurse'
        ? 'nurse_registration'
        : 'hospice_registration';
    }
    if (title.includes('suspension')) return 'suspension_request';
    if (title.includes('deletion')) return 'deletion_request';

    return 'default';
  };

  const configKey = getConfigKey();
  const config = activityTypeConfig[configKey] || {
    label: 'Activity',
    icon: <Clock className="h-4 w-4" />,
    color: 'text-gray-600',
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification._id);
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkRead && !notification.isRead) {
      onMarkRead(notification._id);
    }
  };

  const getEntityName = () => {
    if (!notification.relatedEntity) return 'Unknown User';
    return notification.type === 'nurse'
      ? (notification.relatedEntity as any).name
      : (notification.relatedEntity as any).businessName;
  };

  const getEntityEmail = () => {
    if (!notification.relatedEntity) return '';
    return (notification.relatedEntity as any).email;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-start gap-4 p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer',
        !notification.isRead && 'bg-muted/30',
      )}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="mt-2">
          <div className="h-2 w-2 rounded-full bg-blue-600" />
        </div>
      )}

      {/* Activity type icon */}
      <div className={cn('mt-1', config.color)}>{config.icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{notification.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {notification.description}
            </p>
            {notification.relatedEntity && (
              <p className="text-xs text-muted-foreground mt-2">
                by {getEntityName()}
                <span className="text-muted-foreground/60 ml-1">
                  ({getEntityEmail()})
                </span>
              </p>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(notification._creationTime), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!notification.isRead && onMarkRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkRead}
            title="Mark as read"
          >
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          title="Delete notification"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600" />
        </Button>
      </div>
    </div>
  );
}
