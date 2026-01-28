import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';

export default function AdminDashboard() {
  return (
    <View
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="background"
    >
      <Text>Admin Dashboard</Text>
      <Text color="gray">Welcome to HospiceConnect Admin Portal</Text>
    </View>
  );
}
