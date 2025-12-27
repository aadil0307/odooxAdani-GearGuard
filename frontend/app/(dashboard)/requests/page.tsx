'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api-client';
import {
  MaintenanceRequest,
  RequestStatus,
  RequestType,
  ApiResponse,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import {
  Plus,
  Search,
  Filter,
  X,
  Columns3,
  Calendar,
  Wrench,
} from 'lucide-react';
import { enumToDisplay, formatDate } from '@/lib/utils';

export default function RequestsPage() {
  const router = useRouter();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: response, isLoading, error } = useQuery<ApiResponse<MaintenanceRequest[]>>({
    queryKey: ['requests', search, statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('requestType', typeFilter);
      
      return api.get(`/requests?${params.toString()}`);
    },
  });

  const requests = (response?.success && Array.isArray(response?.data)) ? response.data : [];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...Object.values(RequestStatus).map(status => ({
      value: status,
      label: enumToDisplay(status),
    })),
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    ...Object.values(RequestType).map(type => ({
      value: type,
      label: enumToDisplay(type),
    })),
  ];

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
  };

  const activeFiltersCount = [search, statusFilter, typeFilter].filter(Boolean).length;

  const getStatusVariant = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.NEW:
        return 'default';
      case RequestStatus.IN_PROGRESS:
        return 'warning';
      case RequestStatus.REPAIRED:
        return 'success';
      case RequestStatus.SCRAP:
        return 'danger';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <Loading text="Loading requests..." />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load requests" type="error" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="mt-1 text-gray-600">
            Manage and track all maintenance requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/requests/kanban')}>
            <Columns3 className="mr-2 h-4 w-4" />
            Kanban
          </Button>
          <Button variant="outline" onClick={() => router.push('/requests/calendar')}>
            <Calendar className="mr-2 h-4 w-4" />
            Calendar
          </Button>
          <Button onClick={() => router.push('/requests/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="info" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={statusOptions}
                />
                <Select
                  label="Type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  options={typeOptions}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Request Count */}
      <div className="text-sm text-gray-600">
        Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wrench className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No requests found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {activeFiltersCount > 0
                ? 'Try adjusting your filters'
                : 'Get started by creating your first maintenance request'}
            </p>
            {activeFiltersCount === 0 && (
              <Button className="mt-4" onClick={() => router.push('/requests/new')}>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/requests/${request.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {request.subject}
                        </h3>
                        <Badge variant={getStatusVariant(request.status)}>
                          {enumToDisplay(request.status)}
                        </Badge>
                        <Badge variant="info">
                          {enumToDisplay(request.requestType)}
                        </Badge>
                      </div>
                      
                      {request.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {request.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {request.equipment && (
                          <div className="flex items-center gap-1">
                            <Wrench className="h-4 w-4" />
                            <span>{request.equipment.name}</span>
                          </div>
                        )}
                        {request.team && (
                          <div className="flex items-center gap-1">
                            <span>{request.team.name}</span>
                          </div>
                        )}
                        {request.scheduledDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(request.scheduledDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-sm text-gray-500 ml-4">
                      <div>Created {formatDate(request.createdAt)}</div>
                      {request.completedDate && (
                        <div className="text-green-600">
                          Completed {formatDate(request.completedDate)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
