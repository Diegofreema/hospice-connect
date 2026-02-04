import { Badge } from '@/components/web/ui/badge';
import { Button } from '@/components/web/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/web/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/web/ui/table';
import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { usePaginatedQuery, useQuery } from 'convex/react';
import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, User } from 'lucide-react-native';
import { Loader } from '../../../../features/admin/shared/loader';

export default function NotificationDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const notification = useQuery(
    api.notifications.getNotificationDetails,
    id ? { messageId: id as Id<'adminNotifications'> } : 'skip',
  );

  const { results, status, loadMore } = usePaginatedQuery(
    api.notifications.getNotificationRecipients,
    id ? { messageId: id as Id<'adminNotifications'> } : 'skip',
    { initialNumItems: 20 },
  );

  if (!notification || status === 'LoadingFirstPage') {
    return <Loader message="Loading notification details..." />;
  }

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Notification Details
          </h1>
          <p className="text-muted-foreground">
            View message content and recipient status
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Message Details */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Message Content</CardTitle>
            <CardDescription>Details of the sent notification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Type
              </p>
              <Badge variant="outline" className="capitalize">
                {notification.type}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Subject
              </p>
              <p className="font-medium">{notification.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Message
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {notification.description}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Sent By
              </p>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {notification.sender?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.sender?.email}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Sent At
              </p>
              <p className="text-sm">
                {format(
                  new Date(notification._creationTime),
                  'MMM dd, yyyy HH:mm',
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recipients List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recipients</CardTitle>
            <CardDescription>
              List of users who received this notification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        No recipients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    results.map((recipient: any) => (
                      <TableRow key={recipient._id}>
                        <TableCell className="font-medium">
                          {recipient.recipientName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {recipient.recipientEmail}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={recipient.isRead ? 'default' : 'secondary'}
                          >
                            {recipient.isRead ? 'Read' : 'Unread'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {status === 'CanLoadMore' && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={() => loadMore(20)}>
                  Load More
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
