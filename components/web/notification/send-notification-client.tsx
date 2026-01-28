'use client';

import { useState } from 'react';
import { useMutation, usePaginatedQuery } from 'convex/react';
import { api } from '@hospice-2/backend/convex/_generated/api';
import type { Id } from '@hospice-2/backend/convex/_generated/dataModel';

type IdType = Id<'nurses'> | Id<'hospices'>;
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Search, ArrowLeft, Send } from 'lucide-react';

export function SendNotificationClient() {
  const router = useRouter();
  const [targetType, setTargetType] = useState<'nurse' | 'hospice'>('nurse');
  const [selectedIds, setSelectedIds] = useState<IdType[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const sendNotification = useMutation(api.notifications.sendNotifications);

  const {
    results: nurses,
    status: nurseStatus,
    loadMore: loadMoreNurses,
  } = usePaginatedQuery(
    api.adminNurses.getNurses,
    {
      status: 'approved',
      discipline: 'all',
      state: 'all',
      searchQuery: targetType === 'nurse' ? searchQuery : undefined,
    },
    { initialNumItems: 20 },
  );

  const {
    results: hospices,
    status: hospiceStatus,
    loadMore: loadMoreHospices,
  } = usePaginatedQuery(
    api.adminHospices.getHospices,
    {
      status: 'approved',
      state: 'all',
      searchQuery: targetType === 'hospice' ? searchQuery : undefined,
    },
    { initialNumItems: 20 },
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const items = targetType === 'nurse' ? nurses : hospices;
      const newIds = items.map((item) => item._id);
      // specific logic: if multiple pages, this only selects visible.
      // For simplicity in this iteration, we merge with existing or replace?
      // "Select multiple" usually implies adding to selection.
      const uniqueIds = Array.from(new Set([...selectedIds, ...newIds]));
      setSelectedIds(uniqueIds);
    } else {
      // Deselect visible items? Or all?
      // Usually "Deselect All" clears everything.
      setSelectedIds([]);
    }
  };

  const toggleSelection = (id: IdType) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSend = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (selectedIds.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    try {
      await sendNotification({
        title,
        description,
        targetType,
        recipientIds: selectedIds,
      });
      toast.success('Notifications sent successfully');
      router.push('/admin/notification');
    } catch (error) {
      console.error(error);
      toast.error('Failed to send notifications');
    }
  };

  const handleTabChange = (value: string) => {
    setTargetType(value as 'nurse' | 'hospice');
    setSelectedIds([]);
    setSearchQuery('');
  };

  const currentList = targetType === 'nurse' ? nurses : hospices;
  const currentStatus = targetType === 'nurse' ? nurseStatus : hospiceStatus;
  const currentLoadMore =
    targetType === 'nurse' ? loadMoreNurses : loadMoreHospices;

  return (
    <div className="space-y-6  pb-10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Send New Notification
          </h1>
          <p className="text-muted-foreground mt-1">
            Compose and send notifications to nurses or hospices
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle>Recipients</CardTitle>
            <CardDescription>
              Select who should receive this notification
            </CardDescription>
            <Tabs
              defaultValue="nurse"
              value={targetType}
              onValueChange={handleTabChange}
              className="w-full mt-4"
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <TabsList className="grid w-full max-w-[200px] grid-cols-2">
                  <TabsTrigger value="nurse">Nurses</TabsTrigger>
                  <TabsTrigger value="hospice">Hospices</TabsTrigger>
                </TabsList>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${targetType}s...`}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 py-2 border-b">
                <Checkbox
                  id="select-all"
                  onCheckedChange={handleSelectAll}
                  checked={
                    selectedIds.length > 0 &&
                    currentList.every((item) => selectedIds.includes(item._id))
                  }
                />
                <Label htmlFor="select-all" className="text-sm font-medium">
                  Select All Visible
                </Label>
                <span className="ml-auto text-sm text-muted-foreground">
                  {selectedIds.length} selected
                </span>
              </div>

              <TabsContent value="nurse" className="mt-0 flex-1 overflow-auto">
                <div className="space-y-1">
                  {nurses.length === 0 &&
                    nurseStatus !== 'LoadingFirstPage' && (
                      <div className="text-center py-10 text-muted-foreground">
                        No approved nurses found.
                      </div>
                    )}
                  {nurses.map((nurse) => (
                    <div
                      key={nurse._id}
                      className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <Checkbox
                        id={nurse._id}
                        checked={selectedIds.includes(nurse._id)}
                        onCheckedChange={() => toggleSelection(nurse._id)}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={nurse._id}
                          className="font-medium cursor-pointer"
                        >
                          {nurse.name}
                        </Label>
                        <div className="text-xs text-muted-foreground">
                          {nurse.email} • {nurse.discipline} •{' '}
                          {nurse.stateOfRegistration}
                        </div>
                      </div>
                    </div>
                  ))}
                  {nurseStatus === 'LoadingMore' && (
                    <div className="flex justify-center p-4">
                      <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-4 flex justify-center">
                    {nurseStatus === 'CanLoadMore' && (
                      <Button
                        variant="outline"
                        onClick={() => loadMoreNurses(20)}
                      >
                        Load More Nurses
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="hospice"
                className="mt-0 flex-1 overflow-auto"
              >
                <div className="space-y-1">
                  {hospices.length === 0 &&
                    hospiceStatus !== 'LoadingFirstPage' && (
                      <div className="text-center py-10 text-muted-foreground">
                        No approved hospices found.
                      </div>
                    )}
                  {hospices.map((hospice) => (
                    <div
                      key={hospice._id}
                      className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <Checkbox
                        id={hospice._id}
                        checked={selectedIds.includes(hospice._id)}
                        onCheckedChange={() => toggleSelection(hospice._id)}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={hospice._id}
                          className="font-medium cursor-pointer"
                        >
                          {hospice.businessName}
                        </Label>
                        <div className="text-xs text-muted-foreground">
                          {hospice.email} • {hospice.state}
                        </div>
                      </div>
                    </div>
                  ))}
                  {hospiceStatus === 'LoadingMore' && (
                    <div className="flex justify-center p-4">
                      <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-4 flex justify-center">
                    {hospiceStatus === 'CanLoadMore' && (
                      <Button
                        variant="outline"
                        onClick={() => loadMoreHospices(20)}
                      >
                        Load More Hospices
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Details</CardTitle>
              <CardDescription>
                Compose your notification message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter notification title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter message content..."
                  className="min-h-[150px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSend}
            disabled={selectedIds.length === 0 || !title.trim()}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Notification ({selectedIds.length})
          </Button>
        </div>
      </div>
    </div>
  );
}

// Importing Send icon as it was used in the button
