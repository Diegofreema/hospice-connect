import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ChannelPreviewUnreadCountProps, useTheme } from 'stream-chat-expo';

export const ChannelPreviewCount = (props: ChannelPreviewUnreadCountProps) => {
  const { maxUnreadCount, unread } = props;
  const {
    theme: {
      channelPreview: { unreadContainer, unreadText },
      colors: { accent_dark_blue },
    },
  } = useTheme();

  if (!unread) {
    return null;
  }

  return (
    <View
      style={[
        styles.unreadContainer,
        { backgroundColor: accent_dark_blue },
        unreadContainer,
      ]}
    >
      <Text numberOfLines={1} style={[styles.unreadText, unreadText]}>
        {unread > maxUnreadCount ? `${maxUnreadCount}+` : unread}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  unreadContainer: {
    alignItems: 'center',
    borderRadius: 8,
    flexShrink: 1,
    justifyContent: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
});
