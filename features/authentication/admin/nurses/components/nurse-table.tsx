import { ActionDialog } from '@/components/web/admin/action-dialog';
import { Badge } from '@/components/web/ui/badge';
import { Button } from '@/components/web/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/web/ui/table';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  cn,
  formatString,
  generateStatusColorAndBackgroundColor,
  generateStatusText,
} from '@/lib/utils';
import { FunctionReturnType } from 'convex/server';
import { Eye, UserCheck, UserX } from 'lucide-react-native';
import { Dispatch, SetStateAction } from 'react';
type Props = {
  nurses: FunctionReturnType<typeof api.adminNurses.getNurses>['page'];
  paginationStatus:
    | 'LoadingFirstPage'
    | 'CanLoadMore'
    | 'LoadingMore'
    | 'Exhausted';
  handleLoadMore: () => void;
  handleSuspendToggle: (nurseId: Id<'nurses'>, currentStatus: boolean) => void;
  setSelectedNurseId: Dispatch<SetStateAction<Id<'nurses'> | null>>;
};

export const NurseTable = ({
  nurses,
  paginationStatus,
  handleLoadMore,
  handleSuspendToggle,
  setSelectedNurseId,
}: Props) => {
  if (paginationStatus === 'LoadingFirstPage') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">S/N</TableHead>
            <TableHead className="font-bold">Name</TableHead>
            <TableHead className="font-bold">Email</TableHead>
            <TableHead className="font-bold">Discipline</TableHead>
            <TableHead className="font-bold">State</TableHead>
            <TableHead className="font-bold">Status</TableHead>
            <TableHead className="text-right font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nurses.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-8"
              >
                No healthcare professional found matching your filters.
              </TableCell>
            </TableRow>
          ) : (
            nurses.map((nurse, index) => (
              <TableRow key={nurse._id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">{nurse.name}</TableCell>
                <TableCell>{nurse.email}</TableCell>
                <TableCell>{nurse.discipline}</TableCell>
                <TableCell>{formatString(nurse.stateOfRegistration)}</TableCell>

                <TableCell>
                  <Badge
                    variant="secondary"
                    className={generateStatusColorAndBackgroundColor(
                      nurse.status,
                    )}
                  >
                    {generateStatusText(nurse.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedNurseId(nurse._id)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {nurse.status !== 'pending' ? (
                      <ActionDialog
                        title={
                          nurse.status === 'suspended'
                            ? 'Reactivate'
                            : nurse.status === 'rejected'
                              ? 'Approve'
                              : 'Suspend'
                        }
                        description={
                          nurse.status === 'suspended'
                            ? 'Are you sure you want to reactivate this nurse?'
                            : nurse.status === 'rejected'
                              ? 'Are you sure you want to approve this nurse?'
                              : 'Are you sure you want to suspend this nurse?'
                        }
                        onAction={() =>
                          handleSuspendToggle(
                            nurse._id,
                            nurse.status === 'suspended' ||
                              nurse.status === 'rejected',
                          )
                        }
                      >
                        <Button
                          className={cn(
                            nurse.status === 'suspended' ||
                              nurse.status === 'rejected'
                              ? 'bg-green-500'
                              : 'bg-red-500',
                          )}
                          size="icon"
                          title={
                            nurse.status === 'suspended'
                              ? 'Reactivate'
                              : nurse.status === 'rejected'
                                ? 'Approve'
                                : 'Suspend'
                          }
                        >
                          {nurse.status === 'suspended' ||
                          nurse.status === 'rejected' ? (
                            <UserCheck className="h-4 w-4 text-white" />
                          ) : (
                            <UserX className="h-4 w-4 text-white" />
                          )}
                        </Button>
                      </ActionDialog>
                    ) : (
                      <Button
                        className=" cursor-not-allowed"
                        disabled
                        size="icon"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter>
          <Button
            onClick={handleLoadMore}
            disabled={paginationStatus !== 'CanLoadMore'}
            className="mt-4"
          >
            {paginationStatus === 'CanLoadMore'
              ? 'Load More'
              : 'No More healthcare professional'}
          </Button>
        </TableFooter>
      </Table>
    </div>
  );
};
