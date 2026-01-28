import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';

export default function AdminForgotPassword() {
  return (
    <View
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="background"
    >
      <Text size="normal">Forgot Password</Text>
      <Text size="medium" color="gray">
        Admin password reset page
      </Text>
    </View>
  );
}
