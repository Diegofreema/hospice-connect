import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';

export default function AdminLogin() {
  return (
    <View
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="background"
    >
      <Text size="normal">Admin Login</Text>
      <Text size="medium" color="gray">
        Web admin portal - Login page coming soon
      </Text>
    </View>
  );
}
