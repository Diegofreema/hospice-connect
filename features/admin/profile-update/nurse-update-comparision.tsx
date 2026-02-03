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

interface NurseUpdateComparisonProps {
  currentProfile: Doc<'nurses'> | null;
  pendingProfile: Doc<'pendingNurseProfile'>;
}

export function NurseUpdateComparison({
  currentProfile,
  pendingProfile,
}: NurseUpdateComparisonProps) {
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
              Personal Information
            </h3>
            <div className="space-y-2 border-l-2 border-muted pl-3">
              <FieldDiff
                label="First Name"
                original={currentProfile?.name.split(' ')[0]}
                updated={pendingProfile.firstName}
              />
              <FieldDiff
                label="Last Name"
                original={currentProfile?.name.split(' ')[1]}
                updated={pendingProfile.lastName}
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground">
              License Information
            </h3>
            <div className="space-y-2 border-l-2 border-muted pl-3">
              <FieldDiff
                label="Discipline"
                original={currentProfile?.discipline}
                updated={pendingProfile.discipline}
              />
              <FieldDiff
                label="License Number"
                original={currentProfile?.licenseNumber}
                updated={pendingProfile.licenseNumber}
              />
              <FieldDiff
                label="License State"
                original={currentProfile?.stateOfRegistration}
                updated={pendingProfile.stateOfRegistration}
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground">
              Location
            </h3>
            <div className="space-y-2 border-l-2 border-muted pl-3">
              <FieldDiff
                label="State"
                original={currentProfile?.stateOfRegistration}
                updated={pendingProfile.stateOfRegistration}
              />

              <FieldDiff
                label="Zip Code"
                original={currentProfile?.zipCode}
                updated={pendingProfile.zipCode}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
