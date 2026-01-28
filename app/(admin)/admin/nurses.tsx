import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';

export default function AdminNurses() {
  return (
    <View flex={1}>
      <Text size="large" isBold>
        Nurses Management
      </Text>
      <Text color="gray">View and manage all nurses</Text>
    </View>
  );
}
