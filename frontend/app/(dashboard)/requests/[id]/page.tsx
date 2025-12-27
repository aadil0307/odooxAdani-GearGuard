'use client';

import { use, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api-client';
import {
  MaintenanceRequest,
  RequestStatus,
  RequestType,
  UserRole,
  ApiResponse,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  User,
  Users,
  Wrench,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { enumToDisplay, formatDate } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RequestDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const userRole = session?.user?.role;

  // Fetch request details
  const { data: response, isLoading, error } = useQuery<ApiResponse<MaintenanceRequest>>({
    queryKey: ['request', id],
    queryFn: () => api.get(`/requests/${id}`),
  });

  const request = response?.data;

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: RequestStatus) => {
      return api.patch(`/requests/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request', id] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update status');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return api.delete(`/requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      router.push('/requests');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to delete request');
    },
  });

  const handleStatusChange = useCallback((status: RequestStatus) => {
    if (confirm(`Change status to ${enumToDisplay(status)}?`)) {
      updateStatusMutation.mutate(status);
    }
  }, [updateStatusMutation]);

  const handleDelete = useCallback(() => {
    if (confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  }, [deleteMutation]);

  const getStatusColor = useCallback((status: RequestStatus) => {
    switch (status) {
      case RequestStatus.NEW:
        return 'border-blue-500 bg-blue-50 text-blue-700';
      case RequestStatus.IN_PROGRESS:
        return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case RequestStatus.REPAIRED:
        return 'border-green-500 bg-green-50 text-green-700';
      case RequestStatus.SCRAP:
        return 'border-red-500 bg-red-50 text-red-700';
      default:
        return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  }, []);

  const getStatusIcon = useCallback((status: RequestStatus) => {
    switch (status) {
      case RequestStatus.NEW:
        return <AlertCircle className="h-5 w-5" />;
      case RequestStatus.IN_PROGRESS:
        return <Clock className="h-5 w-5" />;
      case RequestStatus.REPAIRED:
        return <CheckCircle className="h-5 w-5" />;
      case RequestStatus.SCRAP:
        return <XCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  }, []);

  const getTypeColor = useCallback((type: RequestType) => {
    return type === RequestType.PREVENTIVE 
      ? 'bg-green-100 text-green-800'
      : 'bg-orange-100 text-orange-800';
  }, []);

  const canEdit = useMemo(() => {
    if (!request || !userRole) return false;
    
    // Admins and Managers can always edit
    if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) {
      return true;
    }
    
    // Technicians can edit if assigned to them
    if (userRole === UserRole.TECHNICIAN && request.assignedToId === session?.user?.id) {
      return true;
    }
    
    // Users can edit their own requests if still NEW
    if (userRole === UserRole.USER && request.createdById === session?.user?.id && request.status === RequestStatus.NEW) {
      return true;
    }
    
    return false;
  }, [request, userRole, session?.user?.id]);

  const canDelete = useMemo(() => {
    return userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;
  }, [userRole]);

  const availableStatusTransitions = useMemo(() => {
    if (!request) return [];
    
    const transitions: RequestStatus[] = [];
    
    switch (request.status) {
      case RequestStatus.NEW:
        transitions.push(RequestStatus.IN_PROGRESS);
        break;
      case RequestStatus.IN_PROGRESS:
        transitions.push(RequestStatus.REPAIRED, RequestStatus.SCRAP);
        break;
      case RequestStatus.REPAIRED:
        // Can reopen if needed
        transitions.push(RequestStatus.IN_PROGRESS);
        break;
      case RequestStatus.SCRAP:
        // Terminal state - no transitions
        break;
    }
    
    return transitions;
  }, [request?.status]);

  if (isLoading) {
    return <Loading text="Loading request details..." />;
  }

  if (error || !request) {
    return <ErrorMessage message="Failed to load request details" type="error" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{request.subject}</h1>
            <p className="mt-1 text-gray-600">
              Request ID: {request.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => router.push(`/requests/${id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              onClick={handleDelete}
              className="border-red-300 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                <span className="text-lg font-semibold">
                  {enumToDisplay(request.status)}
                </span>
              </div>

              {availableStatusTransitions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Change status to:</p>
                  <div className="flex gap-2 flex-wrap">
                    {availableStatusTransitions.map((status) => (
                      <Button
                        key={status}
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(status)}
                        disabled={updateStatusMutation.isPending}
                      >
                        {enumToDisplay(status)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {request.description ? (
                <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </CardContent>
          </Card>

          {/* Equipment Card */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{request.equipment?.name}</p>
                  <p className="text-sm text-gray-600">
                    S/N: {request.equipment?.serialNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    Category: {enumToDisplay(request.equipment?.category || '')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/equipment/${request.equipmentId}`)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Request Type</p>
                <Badge className={getTypeColor(request.requestType)}>
                  {enumToDisplay(request.requestType)}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Created</p>
                <div className="flex items-center gap-2 text-gray-900">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(request.createdAt)}</span>
                </div>
              </div>

              {request.scheduledDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Scheduled Date</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(request.scheduledDate)}</span>
                  </div>
                </div>
              )}

              {request.completedAt && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(request.completedAt)}</span>
                  </div>
                </div>
              )}

              {request.durationHours && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Clock className="h-4 w-4" />
                    <span>{request.durationHours} hours</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team & Assignment Card */}
          <Card>
            <CardHeader>
              <CardTitle>Team & Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.team && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Maintenance Team</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Users className="h-4 w-4" />
                    <span>{request.team.name}</span>
                  </div>
                </div>
              )}

              {request.assignedTo && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Assigned To</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <User className="h-4 w-4" />
                    <div>
                      <p className="font-medium">{request.assignedTo.name}</p>
                      <p className="text-sm text-gray-600">{request.assignedTo.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-1">Created By</p>
                <div className="flex items-center gap-2 text-gray-900">
                  <User className="h-4 w-4" />
                  <div>
                    <p className="font-medium">{request.createdBy?.name}</p>
                    <p className="text-sm text-gray-600">{request.createdBy?.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
