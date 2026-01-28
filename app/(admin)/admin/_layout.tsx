import { Stack } from 'expo-router';

const AdminDashboardLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="notification" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="route-sheets" />
      <Stack.Screen name="nurses" />
      <Stack.Screen name="hospices" />
      <Stack.Screen name="assignments" />
    </Stack>
  );
};

export default AdminDashboardLayout;
