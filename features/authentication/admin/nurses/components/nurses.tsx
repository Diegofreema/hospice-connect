'use client';

import { NurseDetailsDialog } from '@/components/web/admin/nurse-details-dialog';
import { PendingApprovalsCard } from '@/components/web/admin/pending-approvals-card';
import { Badge } from '@/components/web/ui/badge';
import { Button } from '@/components/web/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/web/ui/card';
import { Input } from '@/components/web/ui/input';
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
import { api } from '@/convex/_generated/api';
import { useMutation, usePaginatedQuery, useQuery } from 'convex/react';
import { Eye, Filter, Search, UserCheck, UserX } from 'lucide-react-native';
import { useState } from 'react';

import { ActionDialog } from '@/components/web/admin/action-dialog';
import type { Id } from '@/convex/_generated/dataModel';
import { type DisciplineType } from '@/convex/schema';
import { usStates } from '@/lib/constants';
import { formatString } from '@/lib/utils';
import { toast } from 'sonner-native';

type Status = 'pending' | 'approved' | 'rejected' | 'suspended';
export function Nurses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState<
    DisciplineType | 'all'
  >('all');
  const [stateFilter, setStateFilter] = useState<string>('all');

  const [selectedNurseId, setSelectedNurseId] = useState<Id<'nurses'> | null>(
    null,
  );
  const [status, setStatus] = useState<Status>('approved');

  const {
    results: nurses,
    status: paginationStatus,
    loadMore,
  } = usePaginatedQuery(
    api.adminNurses.getNurses,
    {
      discipline: disciplineFilter,
      state: stateFilter,
      status,
    },
    { initialNumItems: 30 },
  );
  const stats = useQuery(api.adminNurses.getNurseStats);
  const suspendNurse = useMutation(api.adminNurses.suspendNurse);

  if (paginationStatus === 'LoadingFirstPage' || stats === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading nurses...</p>
        </div>
      </div>
    );
  }

  const handleLoadMore = () => {
    if (paginationStatus === 'CanLoadMore') {
      loadMore(25);
    }
  };

  const pendingNurses = nurses
    .filter((n) => n.status === 'pending')
    .map((n) => ({
      id: n._id,
      name: n.name,
      email: n.email,
      discipline: n.discipline,
      state: formatString(n.stateOfRegistration),
    }));

  const disciplines = ['RN', 'LVN', 'HHA'];

  const handleSuspendToggle = async (
    nurseId: Id<'nurses'>,
    currentStatus: boolean,
  ) => {
    try {
      await suspendNurse({ nurseId, isSuspended: !currentStatus });
      toast.success(currentStatus ? 'Nurse Reactivated' : 'Nurse Suspended', {
        description: currentStatus
          ? 'The nurse account has been reactivated successfully.'
          : 'The nurse account has been suspended successfully.',
      });
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to update nurse status. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nurses Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage nurse profiles, approvals, and suspensions
        </p>
      </div>

      {/* Pending Approvals */}
      {pendingNurses.length > 0 && (
        <PendingApprovalsCard
          pendingItems={pendingNurses}
          type="nurse"
          onRefresh={() => {
            // Convex will auto-refresh
          }}
        />
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Nurses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNurses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedNurses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Suspended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspendedNurses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingNurses}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Nurses List</CardTitle>
          <CardDescription>Search and filter nurse profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={disciplineFilter}
              onValueChange={(value: DisciplineType) =>
                setDisciplineFilter(value)
              }
            >
              <SelectTrigger className="w-full md:w-45">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Discipline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Disciplines</SelectItem>
                {disciplines.map((discipline) => (
                  <SelectItem key={discipline} value={discipline}>
                    {discipline}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-full md:w-45">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {usStates.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value: Status) => setStatus(value)}
            >
              <SelectTrigger className="w-full md:w-45">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>State</TableHead>

                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nurses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      No nurses found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  nurses.map((nurse) => (
                    <TableRow key={nurse._id}>
                      <TableCell className="font-medium">
                        {nurse.name}
                      </TableCell>
                      <TableCell>{nurse.email}</TableCell>
                      <TableCell>{nurse.discipline}</TableCell>
                      <TableCell>
                        {formatString(nurse.stateOfRegistration)}
                      </TableCell>

                      <TableCell>
                        {nurse.status === 'suspended' ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : nurse.status === 'approved' ? (
                          <Badge variant="default">Approved</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
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
                          {nurse.status !== 'pending' && (
                            <ActionDialog
                              title={
                                nurse.status === 'suspended'
                                  ? 'Reactivate'
                                  : 'Suspend'
                              }
                              description={
                                nurse.status === 'suspended'
                                  ? 'Are you sure you want to reactivate this nurse?'
                                  : 'Are you sure you want to suspend this nurse?'
                              }
                              onAction={() =>
                                handleSuspendToggle(
                                  nurse._id,
                                  nurse.status === 'suspended',
                                )
                              }
                            >
                              <Button
                                variant={
                                  nurse.status === 'suspended'
                                    ? 'default'
                                    : 'destructive'
                                }
                                size="icon"
                                title={
                                  nurse.status === 'suspended'
                                    ? 'Reactivate'
                                    : 'Suspend'
                                }
                              >
                                {nurse.status === 'suspended' ? (
                                  <UserCheck className="h-4 w-4" />
                                ) : (
                                  <UserX className="h-4 w-4" />
                                )}
                              </Button>
                            </ActionDialog>
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
                    : 'No More Nurses'}
                </Button>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      {selectedNurseId && (
        <NurseDetailsDialog
          nurseId={selectedNurseId}
          open={!!selectedNurseId}
          onClose={() => setSelectedNurseId(null)}
        />
      )}
    </div>
  );
}
