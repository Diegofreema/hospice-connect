import { useAuth } from '@/components/context/auth';
import { Stack } from 'expo-router';

const AdminLayout = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="index" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="reset-password" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="admin" />
      </Stack.Protected>
    </Stack>
  );
};

export default AdminLayout;
