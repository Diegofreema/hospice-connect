import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';

export default function AdminResetPassword() {
  return (
    <View flex={1} justifyContent="center" alignItems="center" bg="background">
      <Text size="xxl" weight="bold">
        Reset Password
      </Text>
      <Text size="md" mt="md" color="gray">
        Admin reset password page
      </Text>
    </View>
  );
}
