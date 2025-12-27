'use client';

import { use, useState, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api-client';
import {
  Equipment,
  MaintenanceRequest,
  ApiResponse,
  RequestStatus,
  RequestType,
  UserRole,
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
  Package,
  FileText,
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Building,
  Tag,
  Shield,
  Plus,
} from 'lucide-react';
import { enumToDisplay, formatDate } from '@/lib/utils';

export default function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Unwrap params Promise (Next.js 15+)
  const { id } = use(params);

  // Fetch equipment details
  const { data: response, isLoading, error } = useQuery<ApiResponse<Equipment>>({
    queryKey: ['equipment', id],
    queryFn: () => api.get(`/equipment/${id}`),
  });

  // Fetch maintenance requests for this equipment
  const { data: requestsResponse } = useQuery<ApiResponse<{ requests: MaintenanceRequest[]; pagination: any }>>({
    queryKey: ['equipment-requests', id],
    queryFn: () => api.get(`/requests?equipmentId=${id}`),
  });

  const equipment = response?.data;
  const requests = (requestsResponse?.success && requestsResponse?.data?.requests) 
    ? requestsResponse.data.requests 
    : [];

  // Memoize calculations to avoid recalculating on every render
  const stats = useMemo(() => {
    const activeRequests = requests.filter(r => 
      r.status !== RequestStatus.REPAIRED && r.status !== RequestStatus.SCRAP
    ).length;
    const completedRequests = requests.filter(r => r.status === RequestStatus.REPAIRED).length;
    const pendingRequests = requests.filter(r => r.status === RequestStatus.NEW).length;
    const inProgressRequests = requests.filter(r => r.status === RequestStatus.IN_PROGRESS).length;
    const uptimePercentage = requests.length > 0 
      ? Math.round(((requests.length - activeRequests) / requests.length) * 100) 
      : 100;

    return {
      activeRequests,
      completedRequests,
      pendingRequests,
      inProgressRequests,
      uptimePercentage,
    };
  }, [requests]);

  const { activeRequests, completedRequests, pendingRequests, inProgressRequests, uptimePercentage } = stats;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/equipment/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      router.push('/equipment');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to delete equipment');
    },
  });

  // Memoize delete handler to prevent recreation on every render
  const handleDelete = useCallback(() => {
    if (showDeleteConfirm) {
      deleteMutation.mutate();
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  }, [showDeleteConfirm, deleteMutation]);

  // Memoize status color calculation
  const getStatusColor = useCallback(() => {
    if (!equipment) return 'border-gray-500 bg-gray-50';
    if (equipment.isScrap) return 'border-red-500 bg-red-50';
    if (activeRequests > 5) return 'border-orange-500 bg-orange-50';
    if (activeRequests > 0) return 'border-yellow-500 bg-yellow-50';
    return 'border-green-500 bg-green-50';
  }, [equipment, activeRequests]);

  // Memoize status badge computation
  const statusBadge = useMemo(() => {
    if (!equipment) return { variant: 'default' as const, text: 'Unknown', icon: AlertTriangle };
    if (equipment.isScrap) return { variant: 'danger' as const, text: 'Scrapped', icon: AlertTriangle };
    if (activeRequests > 5) return { variant: 'danger' as const, text: 'Critical', icon: AlertTriangle };
    if (activeRequests > 0) return { variant: 'warning' as const, text: 'Under Maintenance', icon: Wrench };
    return { variant: 'success' as const, text: 'Operational', icon: CheckCircle };
  }, [equipment, activeRequests]);

  if (isLoading) {
    return <Loading text="Loading equipment details..." />;
  }

  if (error || !equipment) {
    return <ErrorMessage message="Failed to load equipment details" type="error" />;
  }

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="h-8 w-px bg-gray-300"></div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {equipment.name}
              </h1>
              <Badge variant={statusBadge.variant} className="scale-110">
                <statusBadge.icon className="h-3 w-3 mr-1" />
                {statusBadge.text}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                {equipment.serialNumber}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5" />
                {enumToDisplay(equipment.department)}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {equipment.physicalLocation}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Smart Maintenance Button - Shows open requests */}
          <Button
            variant={activeRequests > 0 ? 'primary' : 'outline'}
            onClick={() => router.push(`/requests?equipmentId=${id}&status=NEW,IN_PROGRESS`)}
            className={activeRequests > 0 ? 'relative bg-orange-600 hover:bg-orange-700' : 'border-slate-300'}
          >
            <Wrench className="mr-2 h-4 w-4" />
            Open Requests
            {activeRequests > 0 && (
              <Badge 
                variant="danger" 
                className="ml-2 bg-red-600 text-white font-bold px-2"
              >
                {activeRequests}
              </Badge>
            )}
          </Button>
          {session?.user?.role !== 'TECHNICIAN' && (
            <Button
              variant="outline"
              onClick={() => router.push(`/maintenance/new?equipmentId=${id}`)}
              className="border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <Wrench className="mr-2 h-4 w-4" />
              New Request
            </Button>
          )}
          {session?.user?.role !== 'USER' && (
            <Button
              variant="outline"
              onClick={() => router.push(`/equipment/${id}/edit`)}
              className="hover:bg-slate-100"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {(session?.user?.role === UserRole.ADMIN || session?.user?.role === UserRole.MANAGER) && (
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="shadow-lg shadow-red-500/20"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {showDeleteConfirm ? 'Confirm?' : 'Delete'}
            </Button>
          )}
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`border-l-4 ${getStatusColor()} transition-all hover:shadow-lg`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Uptime</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{uptimePercentage}%</p>
                <p className="text-xs text-slate-500 mt-1">System availability</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500 bg-blue-50/50 transition-all hover:shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Active</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{activeRequests}</p>
                <p className="text-xs text-slate-500 mt-1">Ongoing requests</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                <Clock className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500 bg-green-50/50 transition-all hover:shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Completed</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{completedRequests}</p>
                <p className="text-xs text-slate-500 mt-1">Finished repairs</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500 bg-purple-50/50 transition-all hover:shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{requests.length}</p>
                <p className="text-xs text-slate-500 mt-1">All time requests</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Equipment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Equipment Information */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-xl">Equipment Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scrap Status</label>
                    <div className="mt-2">
                      <Badge variant={equipment.isScrap ? "danger" : "success"} className="text-sm px-3 py-1">
                        {equipment.isScrap ? 'Scrapped' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</label>
                    <div className="mt-2 flex items-center gap-2">
                      <Building className="h-4 w-4 text-slate-400" />
                      <p className="font-medium text-slate-900">{enumToDisplay(equipment.department)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</label>
                    <div className="mt-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <p className="font-medium text-slate-900">{equipment.physicalLocation}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scrap Status</label>
                    <div className="mt-2">
                      <Badge variant={equipment.isScrap ? "danger" : "success"} className="text-sm px-3 py-1">
                        {equipment.isScrap ? 'Scrapped' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Purchase Date</label>
                    <div className="mt-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <p className="font-medium text-slate-900">{formatDate(equipment.purchaseDate)}</p>
                    </div>
                  </div>

                  {equipment.warrantyExpiry && (
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Warranty Expiry</label>
                      <div className="mt-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-slate-400" />
                        <p className="font-medium text-slate-900">{formatDate(equipment.warrantyExpiry)}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Serial Number</label>
                    <div className="mt-2 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-slate-400" />
                      <p className="font-mono text-sm font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded">
                        {equipment.serialNumber}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</label>
                    <div className="mt-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <p className="font-medium text-slate-900">{formatDate(equipment.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {equipment.isScrap && (
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">Equipment Scrapped</p>
                      <p className="text-sm text-red-700 mt-1">
                        This equipment has been marked as scrapped and is no longer in service.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Maintenance History */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-xl">Maintenance History</CardTitle>
                </div>
                <Badge variant="info" className="text-sm">
                  {requests.length} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Wrench className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No Maintenance Records
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    This equipment has no maintenance history yet
                  </p>
                  <Button
                    onClick={() => router.push(`/maintenance/new?equipmentId=${id}`)}
                    className="shadow-lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Request
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.slice(0, 5).map((request) => {
                    const StatusIcon = request.status === RequestStatus.REPAIRED ? CheckCircle :
                                      request.status === RequestStatus.IN_PROGRESS ? Clock :
                                      request.status === RequestStatus.SCRAP ? XCircle : FileText;
                    
                    return (
                      <div
                        key={request.id}
                        className="group p-4 border-2 border-slate-100 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white hover:bg-blue-50/30"
                        onClick={() => router.push(`/maintenance/${request.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`mt-1 p-2 rounded-lg ${
                              request.status === RequestStatus.REPAIRED ? 'bg-green-100' :
                              request.status === RequestStatus.IN_PROGRESS ? 'bg-blue-100' :
                              request.status === RequestStatus.SCRAP ? 'bg-red-100' : 'bg-slate-100'
                            }`}>
                              <StatusIcon className={`h-4 w-4 ${
                                request.status === RequestStatus.REPAIRED ? 'text-green-600' :
                                request.status === RequestStatus.IN_PROGRESS ? 'text-blue-600' :
                                request.status === RequestStatus.SCRAP ? 'text-red-600' : 'text-slate-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                                  {request.subject}
                                </h4>
                              </div>
                              <p className="text-sm text-slate-600 line-clamp-1 mb-2">
                                {request.description}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                  variant={
                                    request.status === RequestStatus.REPAIRED ? 'success' :
                                    request.status === RequestStatus.IN_PROGRESS ? 'warning' :
                                    request.status === RequestStatus.SCRAP ? 'danger' : 'default'
                                  }
                                  className="text-xs"
                                >
                                  {enumToDisplay(request.status)}
                                </Badge>
                                <Badge variant="info" className="text-xs">
                                  {enumToDisplay(request.requestType)}
                                </Badge>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-slate-500">
                                  {formatDate(request.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {requests.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => router.push(`/maintenance?equipmentId=${id}`)}
                    >
                      View All {requests.length} Requests
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg">
                  <Wrench className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
                <p className="text-blue-100 text-sm">Manage equipment maintenance</p>
              </div>
              <div className="space-y-3">
                <Button
                  className="w-full bg-white text-blue-700 hover:bg-blue-50 shadow-lg font-semibold"
                  onClick={() => router.push(`/maintenance/new?equipmentId=${id}`)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Maintenance Request
                </Button>
                {session?.user?.role !== 'USER' && (
                  <Button
                    variant="outline"
                    className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                    onClick={() => router.push(`/equipment/${id}/edit`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Equipment
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                  onClick={() => router.push(`/maintenance?equipmentId=${id}`)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View All Requests
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
              <CardTitle className="text-lg">Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Pending</p>
                    <p className="text-xs text-slate-500">Awaiting assignment</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-yellow-600">{pendingRequests}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">In Progress</p>
                    <p className="text-xs text-slate-500">Currently working</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-600">{inProgressRequests}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Completed</p>
                    <p className="text-xs text-slate-500">Finished repairs</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600">{completedRequests}</p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">Success Rate</span>
                  <span className="font-bold text-slate-900">{uptimePercentage}%</span>
                </div>
                <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${uptimePercentage}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Health */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
              <CardTitle className="text-lg">Equipment Health</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className={`mx-auto h-24 w-24 rounded-full flex items-center justify-center mb-3 ${
                  uptimePercentage >= 90 ? 'bg-green-100' :
                  uptimePercentage >= 70 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <span className={`text-3xl font-bold ${
                    uptimePercentage >= 90 ? 'text-green-600' :
                    uptimePercentage >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {uptimePercentage}%
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  {uptimePercentage >= 90 ? 'Excellent' :
                   uptimePercentage >= 70 ? 'Good' :
                   uptimePercentage >= 50 ? 'Fair' : 'Poor'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Overall health status</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Total Requests</span>
                  <span className="font-semibold text-slate-900">{requests.length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Active Issues</span>
                  <span className="font-semibold text-slate-900">{activeRequests}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-600">Resolved</span>
                  <span className="font-semibold text-slate-900">{completedRequests}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
