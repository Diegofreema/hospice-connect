import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';

export default function AdminHospices() {
  return (
    <View
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="background"
    >
      <Text>Hospices Management</Text>
      <Text>View and manage all hospices</Text>
    </View>
  );
}
