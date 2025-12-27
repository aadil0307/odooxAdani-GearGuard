'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import api from '@/lib/api-client';
import { ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, TrendingUp, Wrench, Users, FileText, Clock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { enumToDisplay } from '@/lib/utils';

interface DashboardStats {
  requests: {
    total: number;
    new: number;
    inProgress: number;
    repaired: number;
    overdue: number;
    recentlyCreated: number;
  };
  equipment: {
    total: number;
    scrap: number;
    active: number;
  };
  teams: {
    total: number;
  };
  myTasks: {
    active: number;
  };
}

interface RequestsByStatus {
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: string;
  }>;
  total: number;
}

interface RequestsByTeam {
  teams: Array<{
    teamId: string;
    teamName: string;
    totalRequests: number;
    statusBreakdown: Record<string, number>;
  }>;
  total: number;
}

interface RequestsByCategory {
  categories: Array<{
    category: string;
    totalRequests: number;
    corrective: number;
    preventive: number;
    new: number;
    inProgress: number;
    repaired: number;
    scrap: number;
  }>;
  total: number;
}

interface DurationAnalysis {
  overall: {
    totalRequests: number;
    totalHours: number;
    averageHours: number;
    minHours: number;
    maxHours: number;
  };
  byType: Record<string, { count: number; totalHours: number; averageHours: number }>;
  byCategory: Record<string, { count: number; totalHours: number; averageHours: number }>;
  byTeam: Array<{
    teamName: string;
    count: number;
    totalHours: number;
    averageHours: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ReportsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  // Fetch all report data
  const { data: dashboardResponse, isLoading: loadingDashboard } = useQuery<ApiResponse<DashboardStats>>({
    queryKey: ['reports', 'dashboard'],
    queryFn: () => api.get('/reports/dashboard'),
  });

  const { data: statusResponse, isLoading: loadingStatus } = useQuery<ApiResponse<RequestsByStatus>>({
    queryKey: ['reports', 'by-status'],
    queryFn: () => api.get('/reports/by-status'),
  });

  const { data: teamResponse, isLoading: loadingTeam } = useQuery<ApiResponse<RequestsByTeam>>({
    queryKey: ['reports', 'by-team'],
    queryFn: () => api.get('/reports/by-team'),
  });

  const { data: categoryResponse, isLoading: loadingCategory } = useQuery<ApiResponse<RequestsByCategory>>({
    queryKey: ['reports', 'by-category'],
    queryFn: () => api.get('/reports/by-category'),
  });

  const { data: durationResponse, isLoading: loadingDuration } = useQuery<ApiResponse<DurationAnalysis>>({
    queryKey: ['reports', 'duration'],
    queryFn: () => api.get('/reports/duration'),
  });

  const dashboard = dashboardResponse?.data;
  const statusData = statusResponse?.data;
  const teamData = teamResponse?.data;
  const categoryData = categoryResponse?.data;
  const durationData = durationResponse?.data;

  const isLoading = loadingDashboard || loadingStatus || loadingTeam || loadingCategory || loadingDuration;

  // Format data for charts
  const statusChartData = useMemo(() => {
    if (!statusData) return [];
    return statusData.statusDistribution.map(item => ({
      name: enumToDisplay(item.status),
      value: item.count,
      percentage: item.percentage,
    }));
  }, [statusData]);

  const teamChartData = useMemo(() => {
    if (!teamData) return [];
    return teamData.teams.map(team => ({
      name: team.teamName.length > 15 ? team.teamName.substring(0, 15) + '...' : team.teamName,
      total: team.totalRequests,
    }));
  }, [teamData]);

  const categoryChartData = useMemo(() => {
    if (!categoryData) return [];
    return categoryData.categories.map(cat => ({
      name: enumToDisplay(cat.category),
      Corrective: cat.corrective,
      Preventive: cat.preventive,
    }));
  }, [categoryData]);

  const durationByTeamData = useMemo(() => {
    if (!durationData) return [];
    return durationData.byTeam.map(team => ({
      name: team.teamName.length > 15 ? team.teamName.substring(0, 15) + '...' : team.teamName,
      average: team.averageHours,
    }));
  }, [durationData]);

  if (isLoading) {
    return <Loading text="Loading reports..." />;
  }

  if (!dashboard) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No data available</h3>
            <p className="mt-2 text-sm text-gray-500">
              Reports will appear once you have maintenance data
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-gray-900">
          Comprehensive overview of maintenance operations and equipment status
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/requests')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {dashboard.requests.total}
                </p>
                <p className="text-xs text-gray-900 mt-1">
                  +{dashboard.requests.recentlyCreated} this week
                </p>
              </div>
              <Wrench className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {dashboard.requests.inProgress}
                </p>
                <p className="text-xs text-gray-900 mt-1">
                  {dashboard.requests.new} new requests
                </p>
              </div>
              <ArrowRight className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">Overdue</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {dashboard.requests.overdue}
                </p>
                <p className="text-xs text-gray-900 mt-1">
                  Requires attention
                </p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {dashboard.requests.repaired}
                </p>
                <p className="text-xs text-gray-900 mt-1">
                  Successfully resolved
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment & Team Stats */}
      {userRole !== 'USER' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/equipment')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">Total Equipment</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {dashboard.equipment.total}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {dashboard.equipment.active} active
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/teams')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">Active Teams</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {dashboard.teams.total}
                  </p>
                  <p className="text-xs text-gray-900 mt-1">
                    Maintenance teams
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">My Active Tasks</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {dashboard.myTasks.active}
                  </p>
                  <p className="text-xs text-gray-900 mt-1">
                    Assigned to you
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests by Status */}
        {statusChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Requests by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, payload }) => `${name}: ${payload.percentage}%`}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Requests by Team */}
        {teamChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Requests by Team</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Requests by Category & Type */}
        {categoryChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Requests by Equipment Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Corrective" fill="#ef4444" />
                  <Bar dataKey="Preventive" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Average Duration by Team */}
        {durationData && durationData.overall.totalRequests > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Average Repair Time by Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-900">Overall Average</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {durationData.overall.averageHours}h
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Min Time</p>
                    <p className="text-2xl font-bold text-green-600">
                      {durationData.overall.minHours}h
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Max Time</p>
                    <p className="text-2xl font-bold text-red-600">
                      {durationData.overall.maxHours}h
                    </p>
                  </div>
                </div>
              </div>
              {durationByTeamData.length > 0 && (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={durationByTeamData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="average" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Table - Category Details */}
      {categoryData && categoryData.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      New
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      In Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Repaired
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Scrap
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categoryData.categories.map((cat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {enumToDisplay(cat.category)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {cat.totalRequests}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cat.new}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        {cat.inProgress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {cat.repaired}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {cat.scrap}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
