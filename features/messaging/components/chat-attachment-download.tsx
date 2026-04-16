import { useToast } from '@/components/demos/toast';
import { saveChatAssetToDevice } from '@/features/messaging/utils/save-chat-asset-to-device';
import { IconDownload } from '@tabler/icons-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import {
  FileAttachment as StreamFileAttachment,
  type FileAttachmentProps,
  type ImageGalleryHeaderCustomComponent,
} from 'stream-chat-expo';

type DownloadButtonProps = {
  fileName?: string | null;
  iconSize?: number;
  mimeType?: string | null;
  style?: ViewStyle;
  url?: string | null;
};

const DownloadButton = ({
  fileName,
  iconSize = 18,
  mimeType,
  style,
  url,
}: DownloadButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const handleDownload = useCallback(async () => {
    if (!url) {
      showToast({
        title: 'Download unavailable',
        subtitle: 'This attachment does not include a downloadable file.',
        autodismiss: true,
      });
      return;
    }

    try {
      setIsSaving(true);
      const result = await saveChatAssetToDevice({ fileName, mimeType, url });

      showToast({
        title:
          result.action === 'saved' ? 'Attachment downloaded' : 'Save dialog open',
        subtitle:
          result.action === 'saved'
            ? `${result.fileName} was saved to your device.`
            : `Choose where to save ${result.fileName}.`,
        autodismiss: true,
      });
    } catch (error) {
      console.log('chat attachment save error', error);
      showToast({
        title: 'Download failed',
        subtitle: 'We could not save this attachment right now.',
        autodismiss: true,
      });
    } finally {
      setIsSaving(false);
    }
  }, [fileName, mimeType, showToast, url]);

  return (
    <Pressable
      accessibilityLabel="Download attachment"
      disabled={!url || isSaving}
      hitSlop={12}
      onPress={handleDownload}
      style={[styles.downloadButton, style, isSaving && styles.disabledButton]}
    >
      {isSaving ? (
        <ActivityIndicator size="small" color="#111827" />
      ) : (
        <IconDownload size={iconSize} color="#111827" />
      )}
    </Pressable>
  );
};

export const DownloadableFileAttachment = (props: FileAttachmentProps) => {
  const { attachment } = props;

  return (
    <View style={styles.fileAttachmentRow}>
      <View style={styles.fileAttachmentContent}>
        <StreamFileAttachment {...props} />
      </View>
      <DownloadButton
        fileName={attachment.title}
        mimeType={attachment.mime_type}
        style={styles.fileDownloadButton}
        url={attachment.asset_url}
      />
    </View>
  );
};

export const ChatImageGalleryDownloadButton: ImageGalleryHeaderCustomComponent = ({
  photo,
}) => {
  return (
    <DownloadButton
      fileName={
        photo?.messageId
          ? `chat-media-${photo.messageId}`
          : `chat-media-${photo?.id || Date.now()}`
      }
      mimeType={photo?.mime_type}
      style={styles.galleryDownloadButton}
      url={photo?.uri}
    />
  );
};

const styles = StyleSheet.create({
  disabledButton: {
    opacity: 0.6,
  },
  downloadButton: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  fileAttachmentContent: {
    flex: 1,
    minWidth: 0,
  },
  fileAttachmentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  fileDownloadButton: {
    marginTop: 4,
  },
  galleryDownloadButton: {
    backgroundColor: '#F3F4F6',
  },
});
