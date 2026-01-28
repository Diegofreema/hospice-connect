'use client';

import { AdminHeader } from './header';
import { AdminSidebar } from './sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin layout wrapper component that provides a consistent layout structure
 * for all admin pages, including sidebar and header.
 * Similar to Next.js layout pattern.
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-64">
        {/* Header */}
        <AdminHeader />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
