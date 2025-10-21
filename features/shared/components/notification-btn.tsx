import { IconBell } from '@tabler/icons-react-native';
import { router, useSegments } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './text';

type Props = {
  count?: number;
};
export const NotificationButton = ({ count = 0 }: Props) => {
  const segments = useSegments();

  const isHospice = segments[2] === '(hospice)';
  const path = isHospice ? '/hospice-notification' : '/nurse-notification';
  const onPress = () => {
    router.push(path);
  };
  const countIsGreaterThanZero = count > 0;
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <IconBell size={25} />
      {countIsGreaterThanZero && (
        <View style={styles.badge}>
          <Text size={'small'} color="white">
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 30,
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'red',
    borderRadius: 50,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
