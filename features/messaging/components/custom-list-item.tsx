import { View } from '@/features/shared/components/view';
import {
  ChannelPreviewMessenger,
  ChannelPreviewMessengerProps,
} from 'stream-chat-expo';
import { ChannelPreviewCount } from './channel-preview-count';

export const CustomListItem = (props: ChannelPreviewMessengerProps) => {
  const { unread } = props;
  const backgroundColor = unread ? '#e6f7ff' : '#fff';
  return (
    <View style={{ backgroundColor }}>
      <ChannelPreviewMessenger
        {...props}
        PreviewUnreadCount={ChannelPreviewCount}
      />
    </View>
  );
};
