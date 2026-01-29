'use client';

import { NotificationDetailsDialog } from '@/components/web/admin/notification/notification-details-dialog';
import { NotificationTable } from '@/components/web/notification/notification-table';
import { Button } from '@/components/web/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/web/ui/card';
import { useRouter } from 'expo-router';
import { Bell, Send } from 'lucide-react-native';
import { useState } from 'react';

export function Notifications() {
  const router = useRouter();
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | null
  >(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewNotification = (messageId: string) => {
    setSelectedNotificationId(messageId);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Notifications & Messaging
          </h1>
          <p className="text-muted-foreground mt-1">
            Send and manage targeted notifications to nurses and hospices
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/notification/send-notification')}
          className="gap-2"
          size="lg"
        >
          <Send className="h-4 w-4" />
          New Notification
        </Button>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification History
          </CardTitle>
          <CardDescription>
            View and manage all sent notifications with advanced filtering and
            pagination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationTable onNotificationClick={handleViewNotification} />
        </CardContent>
      </Card>

      <NotificationDetailsDialog
        messageId={selectedNotificationId}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
}
