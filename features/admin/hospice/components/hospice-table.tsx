import { ActionDialog } from '@/components/web/admin/action-dialog';
import { Badge } from '@/components/web/ui/badge';
import { Button } from '@/components/web/ui/button';
import { TableBody, TableCell, TableRow } from '@/components/web/ui/table';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { changeFirstLetterToCapital } from '@/features/shared/utils';
import {
  cn,
  generateStatusColorAndBackgroundColor,
  generateStatusText,
} from '@/lib/utils';
import { FunctionReturnType } from 'convex/server';
import {
  Building2,
  Building2 as Building2Check,
  Eye,
} from 'lucide-react-native';
import React from 'react';
import { Loader } from '../../shared/loader';
type Props = {
  handleSuspendToggle: (id: Id<'hospices'>, isSuspended: boolean) => void;
  setSelectedHospiceId: (id: Id<'hospices'>) => void;
  hospices: FunctionReturnType<typeof api.adminHospices.getHospices>['page'];
  isLoading: boolean;
};

const HospiceTable = ({
  handleSuspendToggle,
  setSelectedHospiceId,
  hospices,
  isLoading,
}: Props) => {
  if (isLoading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={7}
            className="text-center text-muted-foreground py-10"
          >
            <Loader message="Loading hospices" />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }
  return (
    <TableBody>
      {hospices.map((hospice, index) => (
        <TableRow key={hospice._id}>
          <TableCell className="font-medium">{index + 1}</TableCell>
          <TableCell className="font-medium">{hospice.businessName}</TableCell>
          <TableCell>{hospice.email}</TableCell>
          <TableCell>{changeFirstLetterToCapital(hospice.state)}</TableCell>
          <TableCell>{hospice.licenseNumber}</TableCell>
          <TableCell>
            <Badge
              className={generateStatusColorAndBackgroundColor(hospice.status)}
            >
              {generateStatusText(hospice.status)}
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedHospiceId(hospice._id)}
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {hospice.status !== 'pending' ? (
                <ActionDialog
                  title={
                    hospice.status === 'suspended'
                      ? 'Reactivate'
                      : hospice.status === 'rejected'
                        ? 'Approve'
                        : 'Suspend'
                  }
                  description={
                    hospice.status === 'suspended'
                      ? 'Are you sure you want to reactivate this hospice?'
                      : hospice.status === 'rejected'
                        ? 'Are you sure you want to approve this hospice?'
                        : 'Are you sure you want to suspend this hospice?'
                  }
                  onAction={() =>
                    handleSuspendToggle(
                      hospice._id,
                      hospice.status === 'suspended' ||
                        hospice.status === 'rejected',
                    )
                  }
                >
                  <Button
                    className={cn(
                      hospice.status === 'suspended' ||
                        hospice.status === 'rejected'
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600',
                    )}
                    size="icon"
                    title={
                      hospice.status === 'suspended'
                        ? 'Reactivate'
                        : hospice.status === 'rejected'
                          ? 'Approve'
                          : 'Suspend'
                    }
                  >
                    {hospice.status === 'suspended' ||
                    hospice.status === 'rejected' ? (
                      <Building2Check className="h-4 w-4 text-white" />
                    ) : (
                      <Building2 className="h-4 w-4 text-white" />
                    )}
                  </Button>
                </ActionDialog>
              ) : (
                <Button className=" cursor-not-allowed" disabled>
                  <Building2 className="h-4 w-4 text-white" />
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};

export default HospiceTable;
