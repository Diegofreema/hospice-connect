import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/web/ui/card';
import type { Doc } from '@/convex/_generated/dataModel';
import { UpdateRow } from './update-row';

interface UpdateListProps {
  updates: Array<Doc<'pendingNurseProfile'> | Doc<'pendingHospiceProfile'>>;
  type: 'nurse' | 'hospice';
  onSelectUpdate: (
    update: Doc<'pendingNurseProfile'> | Doc<'pendingHospiceProfile'>,
  ) => void;
  isLoading?: boolean;
}

export function UpdateList({
  updates,
  type,
  onSelectUpdate,
  isLoading = false,
}: UpdateListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="ml-4 text-muted-foreground">Loading updates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (updates.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              No pending {type} profile updates at this time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Pending {type === 'nurse' ? 'Nurse' : 'Hospice'} Profile Updates
        </CardTitle>
        <CardDescription>
          {updates.length} update{updates.length !== 1 ? 's' : ''} waiting for
          approval
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {updates.map((update) => (
            <UpdateRow
              key={update._id}
              update={update}
              type={type}
              onView={() => onSelectUpdate(update)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
