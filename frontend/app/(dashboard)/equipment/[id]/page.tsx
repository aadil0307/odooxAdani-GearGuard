'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api-client';
import {
  Equipment,
  MaintenanceRequest,
  ApiResponse,
  RequestStatus,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import {
  ArrowLeft,
  Edit,
  Trash2,
  AlertTriangle,
  Calendar,
  MapPin,
  User,
  DollarSign,
  FileText,
  Wrench,
} from 'lucide-react';
import { enumToDisplay, formatDate } from '@/lib/utils';

export default function EquipmentDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch equipment details
  const { data: equipmentResponse, isLoading, error } = useQuery<ApiResponse<Equipment>>({
    queryKey: ['equipment', params.id],
    queryFn: () => api.get(`/equipment/${params.id}`),
  });

  // Fetch maintenance requests for this equipment
  const { data: requestsResponse } = useQuery<ApiResponse<MaintenanceRequest[]>>({
    queryKey: ['equipment-requests', params.id],
    queryFn: () => api.get(`/equipment/${params.id}/requests`),
  });

  const equipment = equipmentResponse?.data;
  const requests = requestsResponse?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/equipment/${params.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      router.push('/equipment');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to delete equipment');
    },
  });

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteMutation.mutate();
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  if (isLoading) {
    return <Loading text="Loading equipment details..." />;
  }

  if (error || !equipment) {
    return <ErrorMessage message="Failed to load equipment details" type="error" />;
  }

  // Calculate request statistics
  const activeRequests = requests.filter(r => 
    r.status !== RequestStatus.REPAIRED && r.status !== RequestStatus.SCRAP
  ).length;
  const completedRequests = requests.filter(r => r.status === RequestStatus.REPAIRED).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{equipment.name}</h1>
            <p className="mt-1 text-gray-600">{equipment.serialNumber}</p>
          </div>
          {equipment.isScrap && (
            <Badge variant="danger">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Scrapped
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/equipment/${params.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {showDeleteConfirm ? 'Confirm Delete?' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Equipment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Category</label>
                <div className="mt-1">
                  <Badge variant="default">{enumToDisplay(equipment.category)}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Department</label>
                <p className="mt-1 font-medium text-gray-900">
                  {enumToDisplay(equipment.department)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="text-sm text-gray-500">Location</label>
                  <p className="mt-1 font-medium text-gray-900">
                    {equipment.physicalLocation}
                  </p>
                </div>
              </div>
              {equipment.assignedEmployeeName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-sm text-gray-500">Assigned To</label>
                    <p className="mt-1 font-medium text-gray-900">
                      {equipment.assignedEmployeeName}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="text-sm text-gray-500">Purchase Date</label>
                  <p className="mt-1 font-medium text-gray-900">
                    {formatDate(equipment.purchaseDate)}
                  </p>
                </div>
              </div>

            </div>

            {equipment.notes && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <label className="text-sm text-gray-500">Notes</label>
                </div>
                <p className="text-gray-900">{equipment.notes}</p>
              </div>
            )}

            {equipment.isScrap && (
              <div className="pt-4 border-t border-red-200 bg-red-50 -mx-6 -mb-6 px-6 py-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Equipment Scrapped</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Active Requests</p>
                <p className="text-2xl font-bold text-blue-600">{activeRequests}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedRequests}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
            <Button
              className="w-full mt-4"
              onClick={() => router.push(`/requests/new?equipmentId=${params.id}`)}
            >
              Create Maintenance Request
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance History */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance History</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No maintenance requests
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                This equipment has no maintenance history yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/requests/${request.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {request.subject}
                      </h4>
                      <Badge
                        variant={
                          request.status === RequestStatus.REPAIRED
                            ? 'success'
                            : request.status === RequestStatus.IN_PROGRESS
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {enumToDisplay(request.status)}
                      </Badge>
                      <Badge variant="info">
                        {enumToDisplay(request.requestType)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Created {formatDate(request.createdAt)}
                      {request.completedDate && ` • Completed ${formatDate(request.completedDate)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
