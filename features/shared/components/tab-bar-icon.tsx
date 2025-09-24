import { Icon } from '@tabler/icons-react-native';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  tabBarIcon: {
    marginBottom: -3,
  },
});

type Props = {
  color: string;
  size?: number;
  icon: Icon;
};

export const TabBarIcon = ({ color, size = 28, icon: Icon }: Props) => {
  return <Icon size={size} color={color} style={styles.tabBarIcon} />;
};
