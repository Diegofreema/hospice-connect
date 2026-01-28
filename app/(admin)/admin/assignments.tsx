import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';

export default function AdminAssignments() {
  return (
    <View
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="background"
    >
      <Text size="normal">Assignments Management</Text>
      <Text size="medium" color="gray">
        View and manage all assignments
      </Text>
    </View>
  );
}
