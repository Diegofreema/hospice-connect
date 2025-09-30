import { IconBell } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export const NotificationButton = () => {
  const onPress = () => {
    router.push('/notification');
  };
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
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
