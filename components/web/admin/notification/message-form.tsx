'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type MessageType = 'notification' | 'news_alert' | 'announcement';

interface MessageFormProps {
  messageType: MessageType;
  onMessageTypeChange: (type: MessageType) => void;
  title: string;
  onTitleChange: (title: string) => void;
  content: string;
  onContentChange: (content: string) => void;
  isScheduled: boolean;
  onScheduledChange: (scheduled: boolean) => void;
}

export function MessageForm({
  messageType,
  onMessageTypeChange,
  title,
  onTitleChange,
  content,
  onContentChange,
  isScheduled,
  onScheduledChange,
}: MessageFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="message-type">Message Type</Label>
        <Select
          value={messageType}
          onValueChange={(value) => onMessageTypeChange(value as MessageType)}
        >
          <SelectTrigger id="message-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="notification">Notification</SelectItem>
            <SelectItem value="news_alert">News Alert</SelectItem>
            <SelectItem value="announcement">Announcement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Enter message title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          placeholder="Enter message content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="schedule"
          checked={isScheduled}
          onCheckedChange={onScheduledChange}
        />
        <Label htmlFor="schedule" className="cursor-pointer font-normal">
          Schedule for later (24 hours from now)
        </Label>
      </div>
    </div>
  );
}
