'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, Clock, FileText } from 'lucide-react';

export function DeletionInfoCard() {
  return (
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-neutral-600" />
          Important Information
        </CardTitle>
        <CardDescription>
          What happens when you delete your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Clock className="h-5 w-5 text-neutral-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-neutral-900">
              30-Day Grace Period
            </h4>
            <p className="text-sm text-neutral-600">
              Your account will be deleted within 30 days. You can cancel the
              deletion request during this period.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <FileText className="h-5 w-5 text-neutral-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-neutral-900">Data Deletion</h4>
            <p className="text-sm text-neutral-600">
              All your personal information, assignments, and related data will
              be permanently deleted. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-neutral-50 p-3 border border-neutral-100">
          <p className="text-xs text-neutral-600">
            Your account history will be anonymized and retained for compliance
            and audit purposes only.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
