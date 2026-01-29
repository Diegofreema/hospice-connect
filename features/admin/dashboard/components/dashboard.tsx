'use client';

import { StatCard } from '@/components/web/admin/stat-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/web/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/web/ui/chart';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import {
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  Users,
} from 'lucide-react-native';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { Loader } from '../../shared/loader';

export function AdminDashboard() {
  const stats = useQuery(api.dashboard.getDashboardStats);
  const chartData = useQuery(api.dashboard.getNewAccountsChartData);
  const assignmentData = useQuery(api.dashboard.getAssignmentStatusData);
  const isLoading =
    stats === undefined ||
    chartData === undefined ||
    assignmentData === undefined;
  if (isLoading) {
    return <Loader message="Loading dashboard" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your hospice management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Nurses"
          value={stats.nurses.total}
          description={`${stats.nurses.approved} approved`}
          icon={Users}
          trend={{
            value: stats.nurses.recentlyCreated,
            label: 'new this month',
          }}
        />
        <StatCard
          title="Total Hospices"
          value={stats.hospices.total}
          description={`${stats.hospices.approved} approved`}
          icon={Building2}
          trend={{
            value: stats.hospices.recentlyCreated,
            label: 'new this month',
          }}
        />
        <StatCard
          title="Active Assignments"
          value={stats.assignments.active}
          description={`${stats.assignments.completed} completed`}
          icon={Calendar}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.nurses.pending + stats.hospices.pending}
          description={`${stats.nurses.pending} nurses, ${stats.hospices.pending} hospices`}
          icon={AlertCircle}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* New Accounts Chart */}
        <Card>
          <CardHeader>
            <CardTitle>New Accounts</CardTitle>
            <CardDescription>
              Nurses and hospices created over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                nurses: {
                  label: 'Nurses',
                  color: 'hsl(var(--chart-1))',
                },
                hospices: {
                  label: 'Hospices',
                  color: 'hsl(var(--chart-2))',
                },
              }}
              className="h-75"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="nurses"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name="Nurses"
                  />
                  <Line
                    type="monotone"
                    dataKey="hospices"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name="Hospices"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Assignment Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment Status</CardTitle>
            <CardDescription>
              Distribution of assignment statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: 'Assignments',
                  color: 'hsl(var(--chart-1))',
                },
              }}
              className="h-75"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assignmentData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="status"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                    name="Assignments"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Suspended Accounts
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.nurses.suspended + stats.hospices.suspended}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.nurses.suspended} nurses, {stats.hospices.suspended}{' '}
              hospices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assignments
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignments.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.assignments.completed} completed, {stats.assignments.ended}{' '}
              ended, {stats.assignments.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.nurses.total > 0
                ? Math.round((stats.nurses.approved / stats.nurses.total) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">For nurse accounts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
