'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/web/ui/card';
import type { Doc } from '@/convex/_generated/dataModel';
import { FieldDiff } from './field-diff';

interface HospiceUpdateComparisonProps {
  currentProfile: Doc<'hospices'> | null;
  pendingProfile: Doc<'pendingHospiceProfile'>;
}

export function HospiceUpdateComparison({
  currentProfile,
  pendingProfile,
}: HospiceUpdateComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Changes</CardTitle>
        <CardDescription>
          Comparing current profile with requested updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground">
              Basic Information
            </h3>
            <div className="space-y-2 border-l-2 border-muted pl-3">
              <FieldDiff
                label="Name"
                original={currentProfile?.businessName}
                updated={pendingProfile.businessName}
              />
              <FieldDiff
                label="Email"
                original={currentProfile?.email}
                updated={pendingProfile.email}
              />
              <FieldDiff
                label="Phone"
                original={currentProfile?.phoneNumber}
                updated={pendingProfile.phoneNumber}
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground">
              Address & License
            </h3>
            <div className="space-y-2 border-l-2 border-muted pl-3">
              <FieldDiff
                label="Address"
                original={currentProfile?.address}
                updated={pendingProfile.address}
              />
              <FieldDiff
                label="City"
                original={currentProfile?.faxNumber}
                updated={pendingProfile.faxNumber}
              />
              <FieldDiff
                label="State"
                original={currentProfile?.state}
                updated={pendingProfile.state}
              />
              <FieldDiff
                label="Zip Code"
                original={currentProfile?.zipcode}
                updated={pendingProfile.zipcode}
              />
              <FieldDiff
                label="License Number"
                original={currentProfile?.licenseNumber}
                updated={pendingProfile.licenseNumber}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
