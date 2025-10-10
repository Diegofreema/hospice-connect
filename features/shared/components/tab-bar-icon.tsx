import { Icon } from '@tabler/icons-react-native';
import { StyleSheet, View } from 'react-native';

export const styles = StyleSheet.create({
  tabBarIcon: {
    marginBottom: -3,
  },
  unread: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    backgroundColor: 'blue',
    borderRadius: 50,
  },
});

type Props = {
  color: string;
  size?: number;
  icon: Icon;
  unreadCount?: number;
};

export const TabBarIcon = ({
  color,
  size = 28,
  icon: Icon,
  unreadCount,
}: Props) => {
  return (
    <View>
      <Icon size={size} color={color} style={styles.tabBarIcon} />
      {!!unreadCount && unreadCount > 0 && <View style={styles.unread} />}
    </View>
  );
};
