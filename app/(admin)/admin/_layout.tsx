import { AdminLayout } from '@/components/web/admin/admin-layout';
import { Slot } from 'expo-router';

const AdminDashboardLayout = () => {
  return (
    <AdminLayout>
      <Slot />
    </AdminLayout>
  );
};

export default AdminDashboardLayout;
