import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';

export default function AdminNotifications() {
  return (
    <View flex={1} justifyContent="center" alignItems="center" bg="background">
      <Text size="xxl" weight="bold">
        Notifications
      </Text>
      <Text size="md" mt="md" color="gray">
        Admin notifications management
      </Text>
    </View>
  );
}
