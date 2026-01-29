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
import { usePaginatedQuery, useQuery } from 'convex/react';
import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { Loader } from '../../shared/loader';
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

  if (status === 'LoadingFirstPage' || !stats) {
    return <Loader message="Loading assignments" />;
  }

  const onLoadMore = () => {
    if (status === 'CanLoadMore') {
      loadMore(25);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="secondary">Staff needed</Badge>;
      case 'booked':
        return <Badge variant="default">Fully staffed</Badge>;
      case 'completed':
        return (
          <Badge className="bg-chart-1 text-primary-foreground">
            Completed
          </Badge>
        );
      case 'ended':
        return <Badge variant="destructive">Ended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Assignments & Schedules
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage nurse assignments and schedules
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
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
            View and manage all nurse assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
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
                  <TableHead>Patient</TableHead>
                  <TableHead>Hospice</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
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
                  results.map((assignment) => (
                    <TableRow key={assignment._id}>
                      <TableCell className="font-medium">
                        {assignment.patientFirstName}{' '}
                        {assignment.patientLastName}
                      </TableCell>

                      <TableCell>{assignment.hospiceName}</TableCell>
                      <TableCell>
                        {new Date(assignment.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {assignment.endDate
                          ? new Date(assignment.endDate).toLocaleDateString()
                          : 'Ongoing'}
                      </TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
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
