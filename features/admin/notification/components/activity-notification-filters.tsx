'use client';

import { Button } from '@/components/web/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/web/ui/select';
import { Filter, X } from 'lucide-react-native';

interface ActivityNotificationFiltersProps {
  activityType: string;
  isRead: string;
  onActivityTypeChange: (type: string) => void;
  onIsReadChange: (status: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function ActivityNotificationFilters({
  activityType,
  isRead,
  onActivityTypeChange,
  onIsReadChange,
  hasActiveFilters,
  onClearFilters,
}: ActivityNotificationFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-b bg-muted/30">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />

        <Select value={activityType} onValueChange={onActivityTypeChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity Types</SelectItem>
            <SelectItem value="profile_update_request">
              Profile Updates
            </SelectItem>
            <SelectItem value="nurse_registration">
              Nurse Registrations
            </SelectItem>
            <SelectItem value="hospice_registration">
              Hospice Registrations
            </SelectItem>
            <SelectItem value="suspension_request">
              Suspension Requests
            </SelectItem>
            <SelectItem value="deletion_request">Deletion Requests</SelectItem>
          </SelectContent>
        </Select>

        <Select value={isRead} onValueChange={onIsReadChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unread">Unread Only</SelectItem>
            <SelectItem value="read">Read Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="gap-1 bg-transparent"
        >
          <X className="h-3 w-3" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
