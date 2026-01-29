import { ResetPassword } from '@/features/admin/auth/components/reset-password';
import { useLocalSearchParams } from 'expo-router';

export default function AdminResetPassword() {
  const { token } = useLocalSearchParams();
  return <ResetPassword token={token as string} />;
}
