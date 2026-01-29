'use client';

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

import { useMutation, usePaginatedQuery, useQuery } from 'convex/react';
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
  const {
    results: unSubmittedSheets,
    status: unSubmittedStatus,
    loadMore: loadMoreUnSubmitted,
  } = usePaginatedQuery(
    api.adminRouteSheets.getUnSubmittedRouteSheets,
    {},
    { initialNumItems: 25 },
  );
  const {
    results: unApprovedSheets,
    status: unApprovedStatus,
    loadMore: loadMoreUnApproved,
  } = usePaginatedQuery(
    api.adminRouteSheets.getUnApprovedSubmittedRouteSheets,
    {},
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

  if (
    suspendedStatus === 'LoadingFirstPage' ||
    unSubmittedStatus === 'LoadingFirstPage' ||
    routSheetStats === undefined ||
    unApprovedStatus === 'LoadingFirstPage'
  ) {
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
          <TabsTrigger value="suspended" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Suspended ({routSheetStats.suspendedNursesCount})
          </TabsTrigger>
        </TabsList>

        {/* Unsubmitted Route Sheets */}
        <TabsContent value="unsubmitted" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unsubmitted Route Sheets</CardTitle>
              <CardDescription>Route sheets not yet submitted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="gap-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nurse Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Discipline</TableHead>
                      <TableHead>Completed Date</TableHead>
                      <TableHead>Overdue</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unSubmittedSheets?.map((sheet) => (
                      <TableRow key={sheet._id}>
                        <TableCell className="font-medium">
                          {sheet.nurse.name}
                        </TableCell>
                        <TableCell>{sheet.nurse.email}</TableCell>
                        <TableCell>
                          <Badge>{sheet.nurse.discipline}</Badge>
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleSuspendNurse(sheet.nurse._id)
                              }
                              className="gap-2"
                              disabled={loading}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Suspend
                            </Button>
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
        </TabsContent>
        {/* Unapproved Route Sheets */}
        <TabsContent value="unapproved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unapproved Route Sheets</CardTitle>
              <CardDescription>Route sheets not yet approved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="gap-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hospice Name</TableHead>
                      <TableHead>Nurse Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Discipline</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>Overdue</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unApprovedSheets?.map((sheet) => (
                      <TableRow key={sheet._id}>
                        <TableCell className="font-medium">
                          {sheet.hospice.businessName}
                        </TableCell>
                        <TableCell className="font-medium">
                          {sheet.nurse.name}
                        </TableCell>
                        <TableCell>{sheet.nurse.email}</TableCell>
                        <TableCell>
                          <Badge>{sheet.nurse.discipline}</Badge>
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
                              onClick={() =>
                                handleNotifyHospice(sheet.hospice._id)
                              }
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
        </TabsContent>
        {/* Suspended Nurses */}
        <TabsContent value="suspended" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suspended Nurses</CardTitle>
              <CardDescription>
                Nurses suspended from accepting new shifts
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
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Discipline</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suspendedNurses?.map((nurse) => (
                      <TableRow key={nurse._id}>
                        <TableCell className="font-medium">
                          {nurse.name}
                        </TableCell>
                        <TableCell>{nurse.email}</TableCell>
                        <TableCell>{nurse.discipline}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleReactivateNurse(nurse._id)}
                              className="gap-2"
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
