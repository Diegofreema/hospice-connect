import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';

export default function AdminRouteSheets() {
  return (
    <View
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="background"
    >
      <Text size="normal">Route Sheets</Text>
      <Text size="medium" color="gray">
        Manage and review route sheets
      </Text>
    </View>
  );
}
