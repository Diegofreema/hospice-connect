'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type NotificationType = 'all' | 'notification' | 'news_alert' | 'announcement';
type ReadStatus = 'all' | 'read' | 'unread';

interface NotificationFiltersProps {
  isRead: ReadStatus;
  onReadStatusChange: (status: ReadStatus) => void;
}

export function NotificationFilters({
  isRead,
  onReadStatusChange,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <div className="space-y-2">
        <Label htmlFor="filter-status">Status</Label>
        <Select
          value={isRead}
          onValueChange={(value) => onReadStatusChange(value as ReadStatus)}
        >
          <SelectTrigger id="filter-status" className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
