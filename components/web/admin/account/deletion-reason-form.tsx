'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DeletionReasonFormProps {
  onReasonChange: (reason: string) => void;
  onCategoryChange: (category: string) => void;
}

const DELETION_REASONS = [
  { value: 'not_using', label: "I'm not using this service anymore" },
  { value: 'poor_experience', label: 'Poor user experience' },
  { value: 'found_alternative', label: 'Found a better alternative' },
  { value: 'privacy_concerns', label: 'Privacy concerns' },
  { value: 'other', label: 'Other reason' },
];

export function DeletionReasonForm({
  onReasonChange,
  onCategoryChange,
}: DeletionReasonFormProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleReasonSelect = (value: string) => {
    setSelectedReason(value);
    onCategoryChange(value);
  };

  const handleCustomReason = (value: string) => {
    setCustomReason(value);
    onReasonChange(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="reason-select" className="text-neutral-700">
          Why are you deleting your account?
        </Label>
        <Select value={selectedReason} onValueChange={handleReasonSelect}>
          <SelectTrigger id="reason-select" className="mt-2">
            <SelectValue placeholder="Select a reason..." />
          </SelectTrigger>
          <SelectContent>
            {DELETION_REASONS.map((reason) => (
              <SelectItem key={reason.value} value={reason.value}>
                {reason.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedReason && (
        <div>
          <Label htmlFor="custom-reason" className="text-neutral-700">
            Additional details (optional)
          </Label>
          <Textarea
            id="custom-reason"
            placeholder="Help us improve by sharing your feedback..."
            value={customReason}
            onChange={(e) => handleCustomReason(e.target.value)}
            className="mt-2 min-h-24 resize-none"
          />
          <p className="text-xs text-neutral-500 mt-1">
            {customReason.length}/500
          </p>
        </div>
      )}
    </div>
  );
}
