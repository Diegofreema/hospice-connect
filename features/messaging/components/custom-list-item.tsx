import { useAuth } from '@/components/context/auth';
import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';
import { type Reaction, renderReaction, trimText } from '@/features/shared/utils';
import {
  ChannelPreviewMessenger,
  type ChannelPreviewMessengerProps,
} from 'stream-chat-expo';
import { ChannelPreviewCount } from './channel-preview-count';

export const CustomListItem = (props: ChannelPreviewMessengerProps) => {
  const { unread, latestMessagePreview } = props;
  const backgroundColor = unread ? '#e6f7ff' : '#fff';
  const { user } = useAuth();
  console.log(latestMessagePreview.messageObject?.latest_reactions);

  return (
    <View style={{ backgroundColor }}>
      <ChannelPreviewMessenger
        {...props}
        PreviewMessage={({ latestMessagePreview }) => (
          <View>
            <Text>
              {latestMessagePreview.messageObject?.latest_reactions?.[0]
                ? renderReaction(
                    latestMessagePreview.messageObject
                      ?.latest_reactions?.[0] as Reaction,
                    user?.id,
                    latestMessagePreview.messageObject?.user?.id,
                    latestMessagePreview.messageObject?.user?.name?.split(
                      ' '
                    )[0]
                  )
                : ''}
              {trimText(latestMessagePreview.messageObject?.text || '', 20)}
            </Text>
          </View>
        )}
        PreviewUnreadCount={ChannelPreviewCount}
      />
    </View>
  );
};
