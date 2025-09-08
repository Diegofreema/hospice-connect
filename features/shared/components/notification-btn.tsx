import { IconBell } from '@tabler/icons-react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';
import View from './view';

export const NotificationButton = () => {
  return (
    <TouchableOpacity style={styles.container}>
      <IconBell size={25} />
      <View style={styles.badge} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'red',
    borderRadius: 50,
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
