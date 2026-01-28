import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';

export default function AdminSettings() {
  return (
    <View flex={1} justifyContent="center" alignItems="center" bg="background">
      <Text size="xxl" weight="bold">
        Settings
      </Text>
      <Text size="md" mt="md" color="gray">
        Admin settings and configuration
      </Text>
    </View>
  );
}
