import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';

export default function AdminDashboard() {
  return (
    <View flex={1}>
      <Text size="large" isBold>
        Admin Dashboard
      </Text>
      <Text color="gray">Welcome to HospiceConnect Admin Portal</Text>
    </View>
  );
}
