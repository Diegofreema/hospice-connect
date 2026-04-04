import { Badge } from '@/components/web/ui/badge';

import { TableBody, TableCell, TableRow } from '@/components/web/ui/table';
import { api } from '@/convex/_generated/api';
import {
  getAssignmentStatusText,
  getColorsForDiscipline,
} from '@/features/shared/utils';
import { getScheduleStatusAndColor } from '@/lib/utils';
import { FunctionReturnType } from 'convex/server';
import { format, parse } from 'date-fns';
import { Loader } from '../../shared/loader';
type Props = {
  results: FunctionReturnType<
    typeof api.adminAssignment.getAssignments
  >['page'];

  status: 'LoadingFirstPage' | 'CanLoadMore' | 'LoadingMore' | 'Exhausted';
};

export const AssignmentBody = ({ results, status }: Props) => {
  if (status === 'LoadingFirstPage') {
    return (
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={7}
            className="text-center text-muted-foreground py-10"
          >
            <Loader message="Loading assignments" />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }
  return (
    <TableBody>
      {results.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={7}
            className="text-center text-muted-foreground py-8"
          >
            No assignments found matching your filters.
          </TableCell>
        </TableRow>
      ) : (
        results.map((assignment, index) => (
          <TableRow key={assignment._id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{assignment.hospiceName}</TableCell>
            <TableCell className="font-medium">
              {assignment.patientFirstName} {assignment.patientLastName}
            </TableCell>
            <TableCell>
              <Badge className={getColorsForDiscipline(assignment.discipline)}>
                {assignment.discipline}
              </Badge>
            </TableCell>
            <TableCell>
              {format(
                parse(assignment.startDate, 'dd-MM-yyyy', new Date()),
                'MM-dd-yyyy',
              )}
            </TableCell>
            <TableCell>
              {assignment.endDate
                ? format(
                    parse(assignment.endDate, 'dd-MM-yyyy', new Date()),
                    'MM-dd-yyyy',
                  )
                : 'Ongoing'}
            </TableCell>
            <TableCell>
              <Badge className={getScheduleStatusAndColor(assignment.status)}>
                {getAssignmentStatusText(assignment.status)}
              </Badge>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  );
};
