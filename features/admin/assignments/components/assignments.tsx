'use client';

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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/web/ui/table';
import { api } from '@/convex/_generated/api';

import { usePaginatedQuery, useQuery } from 'convex/react';

import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { Loader } from '../../shared/loader';
import { AssignmentBody } from './assignment-body';
type AssignmentStatus =
  | 'all'
  | 'completed'
  | 'not_covered'
  | 'booked'
  | 'available'
  | 'ended';
export function Assignments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus>('all');

  const { status, loadMore, results } = usePaginatedQuery(
    api.adminAssignment.getAssignments,
    { status: statusFilter, searchQuery },
    { initialNumItems: 25 },
  );
  const stats = useQuery(api.adminAssignment.getAssignmentStats);

  if (!stats) {
    return <Loader message="Loading assignments" />;
  }

  const onLoadMore = () => {
    if (status === 'CanLoadMore') {
      loadMore(25);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Assignments & Schedules
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage healthcare professionals assignments and schedules
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments List</CardTitle>
          <CardDescription>
            View and manage all healthcare professional&apos;s assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1 flex items-center space-x-2 border rounded-md px-2">
              <Search className=" text-muted-foreground" size={20} />
              <Input
                placeholder="Search by patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: AssignmentStatus) =>
                setStatusFilter(value)
              }
            >
              <SelectTrigger className="w-full md:w-45">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Fully staffed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">S/N</TableHead>
                  <TableHead className="font-bold">Hospice</TableHead>
                  <TableHead className="font-bold">Patient</TableHead>
                  <TableHead className="font-bold">Discipline</TableHead>
                  <TableHead className="font-bold">Start Date</TableHead>
                  <TableHead className="font-bold">End Date</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <AssignmentBody results={results} status={status} />
              <TableFooter>
                <Button
                  onClick={onLoadMore}
                  disabled={status !== 'CanLoadMore'}
                  className="mt-4"
                >
                  {status === 'CanLoadMore'
                    ? 'Load More'
                    : 'No More Assignments'}
                </Button>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
