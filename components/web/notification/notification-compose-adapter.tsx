'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@hospice-2/backend/convex/_generated/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MessageForm } from './message-form';
import { TargetSelector } from './target-selector';
import { Loader2 } from 'lucide-react';

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
  const { toast } = useToast();

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
      toast({
        title: 'Missing Information',
        description: 'Please fill in title and content',
        variant: 'destructive',
      });
      return;
    }

    if (targetType === 'by_state' && selectedStates.length === 0) {
      toast({
        title: 'Missing Selection',
        description: 'Please select at least one state',
        variant: 'destructive',
      });
      return;
    }

    if (targetType === 'by_discipline' && selectedDisciplines.length === 0) {
      toast({
        title: 'Missing Selection',
        description: 'Please select at least one discipline',
        variant: 'destructive',
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

      toast({
        title: 'Success',
        description: isScheduled
          ? 'Message scheduled successfully'
          : 'Message sent successfully',
      });

      handleReset();
      onOpenChange(false);
      onMessageSent?.();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
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
