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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/web/ui/tabs';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { Activity, Bell, Send } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityNotification } from '../types';
import { ActivityNotificationDetails } from './activity-notification-detail';
import { ActivityNotificationList } from './activity-notification-list';

export function Notifications() {
  const router = useRouter();
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | null
  >(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const hasUnreadNotifications = useQuery(
    api.adminActivityNotifications.hasAdminActivityHaveUnreadNotifications,
  );
  const hasUnread = !!hasUnreadNotifications;
  const unreadCount = hasUnreadNotifications || 0;
  const [selectedActivityNotification, setSelectedActivityNotification] =
    useState<ActivityNotification | null>(null);
  const [isActivityDetailsOpen, setIsActivityDetailsOpen] = useState(false);

  const handleViewNotification = (messageId: string) => {
    setSelectedNotificationId(messageId);
    router.push(`/admin/notification/${messageId}`);
    // setIsDetailsOpen(true);
  };

  const handleViewActivityNotification = (notification: any) => {
    setSelectedActivityNotification(notification);
    setIsActivityDetailsOpen(true);
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
            Send and manage targeted notifications to Healthcare professionals
            and hospices
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

      <Tabs defaultValue="sent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Sent Notifications
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            User Activities{' '}
            {hasUnread && (
              <span className=" text-xs text-black bg-white rounded-full  px-2 py-1 inline-block">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Sent Notifications Tab */}
        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification History
              </CardTitle>
              <CardDescription>
                View and manage all sent notifications with advanced filtering
                and pagination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationTable onNotificationClick={handleViewNotification} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                User Activities
              </CardTitle>
              <CardDescription>
                View activities triggered by nurses and hospices such as profile
                updates, registrations, and requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityNotificationList
                onNotificationClick={handleViewActivityNotification}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NotificationDetailsDialog
        messageId={selectedNotificationId}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
      <ActivityNotificationDetails
        notification={selectedActivityNotification}
        open={isActivityDetailsOpen}
        onOpenChange={setIsActivityDetailsOpen}
      />
    </div>
  );
}
