import { AdminLayout } from '@/components/web/admin/admin-layout';
import { LoadingComponent } from '@/features/shared/components/loading';
import { Authenticated, Unauthenticated } from 'convex/react';
import { Slot } from 'expo-router';

const AdminDashboardLayout = () => {
  return (
    <>
      <Unauthenticated>
        <LoadingComponent />
      </Unauthenticated>
      <Authenticated>
        <AdminLayout>
          <Slot initialRouteName="index" />
        </AdminLayout>
      </Authenticated>
    </>
  );
};

export default AdminDashboardLayout;
