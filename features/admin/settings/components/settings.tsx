import { CommissionCard } from '@/components/web/admin/commision-card';
import { PasswordCard } from '@/components/web/admin/password-card';
import { ProfileCard } from '@/components/web/admin/profile-card';
export function Settings() {
  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Account Settings</h1>
        <p className="mt-2 text-black">
          Manage your profile, security, and commission settings
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <ProfileCard />
        </div>
        <PasswordCard />
        {/* <TwoFactorCard /> */}
        <CommissionCard />
      </div>

      {/* Footer Info */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          For security reasons, changes to your account are logged and
          monitored. If you notice any unauthorized activity, please contact
          support immediately.
        </p>
      </div>
    </div>
  );
}
