import { Badge } from '@/components/web/ui/badge';
import { Button } from '@/components/web/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/web/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/web/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/web/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/web/ui/tabs';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

import { getColorsForDiscipline } from '@/features/shared/utils';
import { useMutation, usePaginatedQuery, useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';
import { format, formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react-native';
import { useState } from 'react';
import { toast } from 'sonner-native';
import { Loader } from '../../shared/loader';

export function RouteSheets() {
  const [loading, setLoading] = useState(false);
  const [unApprovedSortOrder, setUnApprovedSortOrder] = useState<
    'desc' | 'asc'
  >('desc');
  const [unSubmittedSortOrder, setUnSubmittedSortOrder] = useState<
    'desc' | 'asc'
  >('desc');
  const {
    results: unSubmittedSheets,
    status: unSubmittedStatus,
    loadMore: loadMoreUnSubmitted,
  } = usePaginatedQuery(
    api.adminRouteSheets.getUnSubmittedRouteSheets,
    { sortOrder: unSubmittedSortOrder },
    { initialNumItems: 25 },
  );
  const {
    results: unApprovedSheets,
    status: unApprovedStatus,
    loadMore: loadMoreUnApproved,
  } = usePaginatedQuery(
    api.adminRouteSheets.getUnApprovedSubmittedRouteSheets,
    { sortOrder: unApprovedSortOrder },
    { initialNumItems: 25 },
  );

  const {
    results: suspendedNurses,
    status: suspendedStatus,
    loadMore: loadMoreSuspended,
  } = usePaginatedQuery(
    api.adminRouteSheets.getSuspendedNurses,
    {},
    { initialNumItems: 25 },
  );

  const routSheetStats = useQuery(api.adminRouteSheets.getRouteSheetStats);
  const suspendNurse = useMutation(api.adminRouteSheets.suspendNurseFromShifts);
  const reactivateNurse = useMutation(api.adminRouteSheets.reactivateNurse);
  const notifyHospice = useMutation(api.adminRouteSheets.notifyHospice);

  const handleSuspendNurse = async (nurseId: Id<'nurses'>) => {
    setLoading(true);
    try {
      await suspendNurse({
        nurseId,
      });
      toast.success('Nurse suspended successfully');
    } catch (error) {
      console.error('Failed to suspend nurse:', error);
      toast.error('Failed to suspend nurse');
    } finally {
      setLoading(false);
    }
  };
  const handleNotifyHospice = async (hospiceId: Id<'hospices'>) => {
    setLoading(true);
    try {
      await notifyHospice({
        hospice: hospiceId,
      });
      toast.success('Hospice notified successfully');
    } catch (error) {
      console.error('Failed to notify hospice:', error);
      toast.error('Failed to notify hospice');
    } finally {
      setLoading(false);
    }
  };
  const handleReactivateNurse = async (nurseId: Id<'nurses'>) => {
    setLoading(true);
    try {
      await reactivateNurse({
        nurseId,
      });
      toast.success('Nurse reactivated successfully');
    } catch (error) {
      console.error('Failed to reactivate nurse:', error);
      toast.error('Failed to reactivate nurse');
    } finally {
      setLoading(false);
    }
  };

  if (suspendedStatus === 'LoadingFirstPage' || routSheetStats === undefined) {
    return <Loader message="Loading route sheets" />;
  }
  const loadMoreSuspendedNurses = () => {
    if (suspendedStatus === 'CanLoadMore') {
      loadMoreSuspended(25);
    }
  };
  const loadMoreUnSubmittedSheets = () => {
    if (unSubmittedStatus === 'CanLoadMore') {
      loadMoreUnSubmitted(25);
    }
  };

  const loadMoreUnApprovedSheets = () => {
    if (unApprovedStatus === 'CanLoadMore') {
      loadMoreUnApproved(25);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Route Sheets Management</h1>
        <p className="text-muted-foreground mt-2">
          Track unsubmitted route sheets and manage nurse suspensions
        </p>
      </div>

      <Tabs defaultValue="unsubmitted" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unsubmitted" className="gap-2">
            <Clock className="h-4 w-4" />
            Unsubmitted ({routSheetStats.unSubmittedRouteSheetsCount})
          </TabsTrigger>
          <TabsTrigger value="unapproved" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Unapproved ({routSheetStats.unApprovedSubmittedRouteSheetsCount})
          </TabsTrigger>
          {/* <TabsTrigger value="approved" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Approved ({routSheetStats.approvedSubmittedRouteSheetsCount})
          </TabsTrigger> */}
          <TabsTrigger value="suspended" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Suspended ({routSheetStats.suspendedNursesCount})
          </TabsTrigger>
        </TabsList>

        {/* Unsubmitted Route Sheets */}
        <TabsContent value="unsubmitted" className="space-y-4">
          <UnSubmittedRouteSheetTab
            unSubmittedSheets={unSubmittedSheets}
            unSubmittedSortOrder={unSubmittedSortOrder}
            setUnSubmittedSortOrder={setUnSubmittedSortOrder}
            loadMoreUnSubmittedSheets={loadMoreUnSubmittedSheets}
            unSubmittedStatus={unSubmittedStatus}
            loading={loading}
            handleSuspendNurse={handleSuspendNurse}
            handleReactivateNurse={handleReactivateNurse}
          />
        </TabsContent>
        {/* Unapproved Route Sheets */}
        <TabsContent value="unapproved" className="space-y-4">
          <UnApprovedRouteSheetTab
            unApprovedSheets={unApprovedSheets}
            unApprovedSortOrder={unApprovedSortOrder}
            setUnApprovedSortOrder={setUnApprovedSortOrder}
            loadMoreUnApprovedSheets={loadMoreUnApprovedSheets}
            unApprovedStatus={unApprovedStatus}
            loading={loading}
            handleNotifyHospice={handleNotifyHospice}
          />
        </TabsContent>
        {/* Suspended Nurses */}
        <TabsContent value="suspended" className="space-y-4">
          <SuspendedNursesTab
            suspendedNurses={suspendedNurses}
            loadMoreSuspendedNurses={loadMoreSuspendedNurses}
            suspendedStatus={suspendedStatus}
            loading={loading}
            handleReactivateNurse={handleReactivateNurse}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type UnSubmittedRouteSheetTabType = {
  unSubmittedSheets: FunctionReturnType<
    typeof api.adminRouteSheets.getUnSubmittedRouteSheets
  >['page'];
  unSubmittedSortOrder: 'desc' | 'asc';
  setUnSubmittedSortOrder: (value: 'desc' | 'asc') => void;
  loadMoreUnSubmittedSheets: () => void;
  unSubmittedStatus:
    | 'CanLoadMore'
    | 'LoadingMore'
    | 'Exhausted'
    | 'LoadingFirstPage';
  loading: boolean;
  handleSuspendNurse: (nurseId: Id<'nurses'>) => void;
  handleReactivateNurse: (nurseId: Id<'nurses'>) => void;
};

const UnSubmittedRouteSheetTab = ({
  unSubmittedSheets,
  unSubmittedSortOrder,
  setUnSubmittedSortOrder,
  loadMoreUnSubmittedSheets,
  unSubmittedStatus,
  loading,
  handleSuspendNurse,
  handleReactivateNurse,
}: UnSubmittedRouteSheetTabType) => {
  if (unSubmittedStatus === 'LoadingFirstPage') {
    return <Loader message="Loading route sheets" />;
  }
  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:space-y-0 justify-between md:items-center gap-4">
        <div className="space-y-1">
          <CardTitle>Unsubmitted Route Sheets</CardTitle>
          <CardDescription>Route sheets not yet submitted</CardDescription>
        </div>
        <Select
          value={unSubmittedSortOrder}
          onValueChange={(value: 'desc' | 'asc') =>
            setUnSubmittedSortOrder(value)
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Most Recent</SelectItem>
            <SelectItem value="asc">Least Recent</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="gap-4">
            <TableHeader>
              <TableRow className="font-bold">
                <TableHead className="font-bold">S/N</TableHead>
                <TableHead className="font-bold">Hospice</TableHead>
                <TableHead className="font-bold">Nurse Name</TableHead>
                <TableHead className="font-bold">Email</TableHead>
                <TableHead className="font-bold">Discipline</TableHead>
                <TableHead className="font-bold">Completed Date</TableHead>
                <TableHead className="font-bold">Overdue</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unSubmittedSheets?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No unsubmitted route sheets
                  </TableCell>
                </TableRow>
              )}
              {[...(unSubmittedSheets ?? [])].map((sheet, index) => (
                <TableRow key={sheet._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {sheet.hospice.businessName}
                  </TableCell>
                  <TableCell className="font-medium">
                    {sheet.nurse.name}
                  </TableCell>
                  <TableCell>{sheet.nurse.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={getColorsForDiscipline(sheet.nurse.discipline)}
                    >
                      {sheet.nurse.discipline}
                    </Badge>
                  </TableCell>
                  {sheet.completedAt && (
                    <TableCell>
                      {format(sheet.completedAt, 'MM/dd/yyyy')}
                    </TableCell>
                  )}
                  {/* overdue days */}
                  {sheet.completedAt && (
                    <TableCell>
                      {formatDistanceToNow(sheet.completedAt)}
                    </TableCell>
                  )}
                  <TableCell className="text-right text-white">
                    <div className="flex justify-end gap-2">
                      {sheet.nurse.status === 'suspended' ? (
                        <Button
                          size="sm"
                          onClick={() => handleReactivateNurse(sheet.nurse._id)}
                          className="gap-2 bg-green-500 hover:bg-green-600 "
                          disabled={loading}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Reactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleSuspendNurse(sheet.nurse._id)}
                          className="gap-2 bg-red-500 hover:bg-red-600"
                          disabled={loading}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Suspend
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {unSubmittedStatus === 'CanLoadMore' && (
              <TableFooter>
                <Button
                  onClick={loadMoreUnSubmittedSheets}
                  disabled={unSubmittedStatus !== 'CanLoadMore'}
                >
                  Load More
                </Button>
              </TableFooter>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

type UnApprovedRouteSheetTabType = {
  unApprovedSheets: FunctionReturnType<
    typeof api.adminRouteSheets.getUnApprovedSubmittedRouteSheets
  >['page'];
  unApprovedSortOrder: 'desc' | 'asc';
  setUnApprovedSortOrder: (value: 'desc' | 'asc') => void;
  loadMoreUnApprovedSheets: () => void;
  unApprovedStatus:
    | 'CanLoadMore'
    | 'LoadingMore'
    | 'Exhausted'
    | 'LoadingFirstPage';
  loading: boolean;
  handleNotifyHospice: (hospiceId: Id<'hospices'>) => void;
};

const UnApprovedRouteSheetTab = ({
  handleNotifyHospice,
  loadMoreUnApprovedSheets,
  loading,
  setUnApprovedSortOrder,
  unApprovedSheets,
  unApprovedSortOrder,
  unApprovedStatus,
}: UnApprovedRouteSheetTabType) => {
  if (unApprovedStatus === 'LoadingFirstPage') {
    return <Loader message="Loading route sheets" />;
  }
  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:space-y-0 justify-between md:items-center gap-4">
        <div className="space-y-1">
          <CardTitle>Unapproved Route Sheets</CardTitle>
          <CardDescription>Route sheets not yet approved</CardDescription>
        </div>
        <Select
          value={unApprovedSortOrder}
          onValueChange={(value: 'desc' | 'asc') =>
            setUnApprovedSortOrder(value)
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Most Recent</SelectItem>
            <SelectItem value="asc">Least Recent</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="gap-4">
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">S/N</TableHead>
                <TableHead className="font-bold">Hospice Name</TableHead>
                <TableHead className="font-bold">Nurse Name</TableHead>
                <TableHead className="font-bold">Email</TableHead>
                <TableHead className="font-bold">Discipline</TableHead>
                <TableHead className="font-bold">Submitted Date</TableHead>
                <TableHead className="font-bold">Overdue</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unApprovedSheets?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No unapproved route sheets
                  </TableCell>
                </TableRow>
              )}
              {unApprovedSheets?.map((sheet, index) => (
                <TableRow key={sheet._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {sheet.hospice.businessName}
                  </TableCell>
                  <TableCell className="font-medium">
                    {sheet.nurse.name}
                  </TableCell>
                  <TableCell>{sheet.nurse.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={getColorsForDiscipline(sheet.nurse.discipline)}
                    >
                      {sheet.nurse.discipline}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(sheet._creationTime, 'MM/dd/yyyy')}
                  </TableCell>

                  <TableCell>
                    {formatDistanceToNow(sheet._creationTime)}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleNotifyHospice(sheet.hospice._id)}
                        className="gap-2"
                        disabled={loading}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Notify Hospice
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {unApprovedStatus === 'CanLoadMore' && (
              <TableFooter>
                <Button
                  onClick={loadMoreUnApprovedSheets}
                  disabled={unApprovedStatus !== 'CanLoadMore'}
                >
                  Load More
                </Button>
              </TableFooter>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

type Props = {
  suspendedNurses: FunctionReturnType<
    typeof api.adminRouteSheets.getSuspendedNurses
  >['page'];

  loadMoreSuspendedNurses: () => void;
  suspendedStatus:
    | 'CanLoadMore'
    | 'LoadingMore'
    | 'Exhausted'
    | 'LoadingFirstPage';
  loading: boolean;
  handleReactivateNurse: (nurseId: Id<'nurses'>) => void;
};

const SuspendedNursesTab = ({
  suspendedNurses,
  loadMoreSuspendedNurses,
  suspendedStatus,
  loading,
  handleReactivateNurse,
}: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suspended Healthcare professionals</CardTitle>
        <CardDescription>
          Healthcare professionals suspended from accepting new shifts
        </CardDescription>
        {/* <div className="mt-4">
                <Input
                  placeholder="Search by nurse name or email..."
                  value={suspendFilter}
                  onChange={(e) => setSuspendFilter(e.target.value)}
                />
              </div> */}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">S/N</TableHead>
                <TableHead className="font-bold">Name</TableHead>
                <TableHead className="font-bold">Email</TableHead>
                <TableHead className="font-bold">Discipline</TableHead>
                <TableHead className="text-right font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suspendedNurses?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No suspended nurses
                  </TableCell>
                </TableRow>
              )}
              {suspendedNurses?.map((nurse, index) => (
                <TableRow key={nurse._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{nurse.name}</TableCell>
                  <TableCell>{nurse.email}</TableCell>
                  <TableCell>
                    <Badge className={getColorsForDiscipline(nurse.discipline)}>
                      {nurse.discipline}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReactivateNurse(nurse._id)}
                        className="gap-2 bg-green-500 text-white hover:bg-green-600"
                        disabled={loading}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Reactivate
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {suspendedStatus === 'CanLoadMore' && (
              <TableFooter className="w-fit mt-5">
                <Button
                  onClick={loadMoreSuspendedNurses}
                  disabled={suspendedStatus !== 'CanLoadMore'}
                  className="mt-4"
                >
                  Load More
                </Button>
              </TableFooter>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
