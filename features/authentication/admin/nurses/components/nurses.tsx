'use client';

import { NurseDetailsDialog } from '@/components/web/admin/nurse-details-dialog';
import { PendingApprovalsCard } from '@/components/web/admin/pending-approvals-card';

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

import { api } from '@/convex/_generated/api';
import { useMutation, usePaginatedQuery, useQuery } from 'convex/react';
import { Filter, Search } from 'lucide-react-native';
import { useState } from 'react';

import type { Id } from '@/convex/_generated/dataModel';
import { type DisciplineType } from '@/convex/schema';
import { usStates } from '@/lib/constants';
import { formatString } from '@/lib/utils';
import { toast } from 'sonner-native';
import { Status } from '../types';
import { NurseTable } from './nurse-table';

export function Nurses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState<
    DisciplineType | 'all'
  >('all');
  const [stateFilter, setStateFilter] = useState<string>('all');

  const [selectedNurseId, setSelectedNurseId] = useState<Id<'nurses'> | null>(
    null,
  );
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

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
      searchQuery,
      sort: sortOrder,
    },
    { initialNumItems: 30 },
  );
  const stats = useQuery(api.adminNurses.getNurseStats);
  const suspendNurse = useMutation(api.adminNurses.suspendNurse);

  if (stats === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
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
    currentStatus: boolean, // if true, it will make them approved (isSuspended: false)
  ) => {
    try {
      await suspendNurse({ nurseId, isSuspended: !currentStatus });
      toast.success(currentStatus ? 'Approved' : 'Suspended', {
        description: `The healthcare professional account has been ${currentStatus ? 'approved/reactivated' : 'suspended'} successfully.`,
      });
    } catch {
      toast.error('Error', {
        description:
          'Failed to update healthcare professional status. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Healthcare professional Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage healthcare professional profiles, approvals, and suspensions
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
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total healthcare professional
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejectedNurses}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Healthcare professional list</CardTitle>
          <CardDescription>Search and filter nurse profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1 flex gap-3 pl-2 rounded-md border border-input items-center">
              <Search className="" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-0 shadow-none flex-1 bg-transparent"
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(value: 'desc' | 'asc') => setSortOrder(value)}
            >
              <SelectTrigger className="w-full md:w-45">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Most Recent</SelectItem>
                <SelectItem value="asc">Least Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <NurseTable
            nurses={nurses}
            paginationStatus={paginationStatus}
            handleLoadMore={handleLoadMore}
            handleSuspendToggle={handleSuspendToggle}
            setSelectedNurseId={setSelectedNurseId}
          />
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
