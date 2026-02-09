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
import {
  Building2,
  Building2 as Building2Check,
  Eye,
  Filter,
  Search,
} from 'lucide-react-native';
import { useState } from 'react';

import { ActionDialog } from '@/components/web/admin/action-dialog';
import { HospiceDetailsDialog } from '@/components/web/admin/hospice-details-dialog';
import { PendingApprovalsCard } from '@/components/web/admin/pending-approvals-card';
import type { Id } from '@/convex/_generated/dataModel';
import { changeFirstLetterToCapital } from '@/features/shared/utils';
import { usStates } from '@/lib/constants';
import {
  cn,
  generateStatusColorAndBackgroundColor,
  generateStatusText,
} from '@/lib/utils';
import { toast } from 'sonner-native';
import { Loader } from '../../shared/loader';

type Status = 'pending' | 'approved' | 'rejected' | 'suspended';
export function Hospices() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [status, setStatus] = useState<Status>('approved');
  const [selectedHospiceId, setSelectedHospiceId] =
    useState<Id<'hospices'> | null>(null);

  const {
    results: hospices,
    status: queryStatus,
    loadMore,
  } = usePaginatedQuery(
    api.adminHospices.getHospices,
    { state: stateFilter, status, searchQuery },
    { initialNumItems: 25 },
  );
  const hospiceStats = useQuery(api.adminHospices.getHospiceStats);
  const suspendHospice = useMutation(api.adminHospices.suspendHospice);

  if (queryStatus === 'LoadingFirstPage' || hospiceStats === undefined) {
    return <Loader message="Loading hospices" />;
  }

  const handleLoadMore = () => {
    if (queryStatus === 'CanLoadMore') {
      loadMore(25);
    }
  };

  const pendingHospices = hospices
    .filter((h) => h.status === 'pending')
    .map((h) => ({
      id: h._id,
      name: h.businessName,
      state: h.state,
      email: h.email,
    }));

  const handleSuspendToggle = async (
    hospiceId: Id<'hospices'>,
    currentStatus: boolean,
  ) => {
    try {
      await suspendHospice({ hospiceId, isSuspended: !currentStatus });
      toast(currentStatus ? 'Hospice Reactivated' : 'Hospice Suspended', {
        description: currentStatus
          ? 'The hospice account has been reactivated successfully.'
          : 'The hospice account has been suspended successfully.',
      });
    } catch (error) {
      toast('Error', {
        description: 'Failed to update hospice status. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hospices Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage hospice profiles, approvals, and suspensions
        </p>
      </div>

      {/* Pending Approvals */}
      {pendingHospices.length > 0 && (
        <PendingApprovalsCard
          pendingItems={pendingHospices}
          type="hospice"
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
              Total Hospices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hospiceStats.totalHospices}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hospiceStats.approvedHospices}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Suspended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hospiceStats.suspendedHospices}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hospiceStats.pendingHospices}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Hospices List</CardTitle>
          <CardDescription>Search and filter hospice profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1 flex items-center border rounded-md pl-2">
              <Search className="" size={20} />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-full md:w-45">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {usStates.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {changeFirstLetterToCapital(state.label)}
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
                <SelectItem value="all">All Status</SelectItem>
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
                  <TableHead className="font-bold">S/N</TableHead>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Email</TableHead>
                  <TableHead className="font-bold">Location</TableHead>
                  <TableHead className="font-bold">License</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hospices.map((hospice, index) => (
                  <TableRow key={hospice._id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {hospice.businessName}
                    </TableCell>
                    <TableCell>{hospice.email}</TableCell>
                    <TableCell>
                      {changeFirstLetterToCapital(hospice.state)}
                    </TableCell>
                    <TableCell>{hospice.licenseNumber}</TableCell>
                    <TableCell>
                      <Badge
                        className={generateStatusColorAndBackgroundColor(
                          hospice.status,
                        )}
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
                                : 'Suspend'
                            }
                            description={
                              hospice.status === 'suspended'
                                ? 'Are you sure you want to reactivate this hospice?'
                                : 'Are you sure you want to suspend this hospice?'
                            }
                            onAction={() =>
                              handleSuspendToggle(
                                hospice._id,
                                hospice.status === 'suspended',
                              )
                            }
                          >
                            <Button
                              className={cn(
                                hospice.status === 'suspended'
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-red-500 hover:bg-red-600',
                              )}
                              size="icon"
                              title={
                                hospice.status === 'suspended'
                                  ? 'Reactivate'
                                  : 'Suspend'
                              }
                            >
                              {hospice.status === 'suspended' ? (
                                <Building2Check className="h-4 w-4" />
                              ) : (
                                <Building2 className="h-4 w-4" />
                              )}
                            </Button>
                          </ActionDialog>
                        ) : (
                          <Button className=" cursor-not-allowed" disabled>
                            <Building2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <Button
                  onClick={handleLoadMore}
                  disabled={queryStatus !== 'CanLoadMore'}
                  className="mt-4"
                >
                  {queryStatus === 'CanLoadMore'
                    ? 'Load More'
                    : 'No More Hospices'}
                </Button>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      {selectedHospiceId && (
        <HospiceDetailsDialog
          hospiceId={selectedHospiceId}
          open={!!selectedHospiceId}
          onClose={() => setSelectedHospiceId(null)}
        />
      )}
    </div>
  );
}
