'use client';

import { Badge } from '@/components/web/ui/badge';
import { Button } from '@/components/web/ui/button';
import type { Doc } from '@/convex/_generated/dataModel';
import { formatDistanceToNow } from 'date-fns';
import { Eye } from 'lucide-react-native';

interface UpdateRowProps {
  update: Doc<'pendingNurseProfile'> | Doc<'pendingHospiceProfile'>;
  type: 'nurse' | 'hospice';
  onView: () => void;
}

export function UpdateRow({ update, type, onView }: UpdateRowProps) {
  const name =
    type === 'nurse'
      ? `${(update as Doc<'pendingNurseProfile'>).firstName} ${(update as Doc<'pendingNurseProfile'>).lastName}`
      : (update as Doc<'pendingHospiceProfile'>).businessName;

  const requestedAt = formatDistanceToNow(new Date(update._creationTime), {
    addSuffix: true,
  });

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Requested {requestedAt}
        </p>
      </div>
      <div className="flex items-center gap-3 ml-4">
        <Badge
          variant="outline"
          className="bg-blue-50 border-blue-200 text-blue-800"
        >
          {type === 'nurse' ? 'Nurse Profile' : 'Hospice Profile'}
        </Badge>
        <Button size="sm" variant="outline" onClick={onView}>
          <Eye className="w-4 h-4 mr-2" />
          Review
        </Button>
      </div>
    </div>
  );
}
