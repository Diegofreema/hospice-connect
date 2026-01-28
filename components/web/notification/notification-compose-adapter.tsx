'use client';

import { Button } from '@/components/web/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/web/ui/dialog';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useState } from 'react';

import { Loader2 } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { MessageForm } from './message-form';
import { TargetSelector } from './target-selector';

type MessageType = 'notification' | 'news_alert' | 'announcement';
type TargetType = 'all_nurses' | 'all_hospices' | 'by_state' | 'by_discipline';

interface NotificationComposerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessageSent?: () => void;
}

export function NotificationComposerDialog({
  open,
  onOpenChange,
  onMessageSent,
}: NotificationComposerDialogProps) {
  const [messageType, setMessageType] = useState<MessageType>('notification');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState<TargetType>('all_nurses');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useMutation(api.notifications.sendTargetedMessage);

  const handleReset = () => {
    setMessageType('notification');
    setTitle('');
    setContent('');
    setTargetType('all_nurses');
    setSelectedStates([]);
    setSelectedDisciplines([]);
    setIsScheduled(false);
  };

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Missing Information', {
        description: 'Please fill in title and content',
      });
      return;
    }

    if (targetType === 'by_state' && selectedStates.length === 0) {
      toast.error('Missing Selection', {
        description: 'Please select at least one state',
      });
      return;
    }

    if (targetType === 'by_discipline' && selectedDisciplines.length === 0) {
      toast.error('Missing Selection', {
        description: 'Please select at least one discipline',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get current user ID (in production, this would come from auth)
      const currentUserId = ''; // This will be set from auth context

      await sendMessage({
        senderId: currentUserId as any,
        messageType,
        title,
        content,
        targetType,
        targetFilters:
          targetType === 'by_state'
            ? { states: selectedStates }
            : targetType === 'by_discipline'
              ? { disciplines: selectedDisciplines }
              : undefined,
        recipientIds: undefined,
        isScheduled,
        scheduledFor: isScheduled
          ? Date.now() + 24 * 60 * 60 * 1000
          : undefined,
      });

      toast.success('Success', {
        description: isScheduled
          ? 'Message scheduled successfully'
          : 'Message sent successfully',
      });

      handleReset();
      onOpenChange(false);
      onMessageSent?.();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Error', {
        description: 'Failed to send message. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compose Notification</DialogTitle>
          <DialogDescription>
            Send targeted notifications to nurses, hospices, or specific groups
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <MessageForm
            messageType={messageType}
            onMessageTypeChange={setMessageType}
            title={title}
            onTitleChange={setTitle}
            content={content}
            onContentChange={setContent}
            isScheduled={isScheduled}
            onScheduledChange={setIsScheduled}
          />

          <div className="border-t pt-4">
            <TargetSelector
              targetType={targetType}
              onTargetTypeChange={setTargetType}
              selectedStates={selectedStates}
              onStatesChange={setSelectedStates}
              selectedDisciplines={selectedDisciplines}
              onDisciplinesChange={setSelectedDisciplines}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                handleReset();
                onOpenChange(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isScheduled ? 'Schedule Message' : 'Send Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
