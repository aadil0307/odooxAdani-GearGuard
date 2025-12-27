'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import api from '@/lib/api-client';
import {
  Equipment,
  MaintenanceTeam,
  MaintenanceRequest,
  RequestType,
  RequestStatus,
  UserRole,
  ApiResponse,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { ArrowLeft, Save, X } from 'lucide-react';
import { enumToDisplay } from '@/lib/utils';

const requestSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().optional(),
  requestType: z.nativeEnum(RequestType),
  equipmentId: z.string().min(1, 'Equipment is required'),
  teamId: z.string().optional(),
  assignedToId: z.string().optional(),
  scheduledDate: z.string().optional(),
  durationHours: z.number().min(0).optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditRequestPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;

  const [formData, setFormData] = useState<Partial<RequestFormData>>({
    subject: '',
    description: '',
    requestType: RequestType.CORRECTIVE,
    equipmentId: '',
    teamId: '',
    assignedToId: '',
    scheduledDate: '',
    durationHours: '' as any,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch request details
  const { data: requestResponse, isLoading: requestLoading, error: requestError } = useQuery<ApiResponse<MaintenanceRequest>>({
    queryKey: ['request', id],
    queryFn: () => api.get(`/requests/${id}`),
  });

  const request = requestResponse?.data;

  // Check permissions
  const canEdit = useMemo(() => {
    if (!request || !userRole) return false;
    
    // Admins and Managers can always edit
    if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) {
      return true;
    }
    
    // Technicians can edit if assigned to them
    if (userRole === UserRole.TECHNICIAN && request.assignedToId === userId) {
      return true;
    }
    
    // Users can edit their own requests if still NEW
    if (userRole === UserRole.USER && request.createdById === userId && request.status === RequestStatus.NEW) {
      return true;
    }
    
    return false;
  }, [request, userRole, userId]);

  // Determine which fields user can edit based on role
  const canEditFullDetails = userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;
  const canAssignTeam = userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;

  // Fetch equipment list
  const { data: equipmentResponse } = useQuery<ApiResponse<{ equipment: Equipment[]; pagination: any }>>({
    queryKey: ['equipment'],
    queryFn: () => api.get('/equipment'),
  });

  const equipment = (equipmentResponse?.success && equipmentResponse?.data?.equipment) 
    ? equipmentResponse.data.equipment.filter(e => !e.isScrap)
    : [];

  // Fetch teams list
  const { data: teamsResponse } = useQuery<ApiResponse<MaintenanceTeam[]>>({
    queryKey: ['teams'],
    queryFn: () => api.get('/teams'),
    enabled: canAssignTeam,
  });

  const teams = teamsResponse?.data || [];

  // Fetch team members when a team is selected
  const { data: teamMembersResponse } = useQuery({
    queryKey: ['team', formData.teamId, 'members'],
    queryFn: () => api.get(`/teams/${formData.teamId}`),
    enabled: !!formData.teamId && canAssignTeam,
  });

  const teamMembers = teamMembersResponse?.data?.members || [];

  // Initialize form with request data
  useEffect(() => {
    if (request) {
      setFormData({
        subject: request.subject,
        description: request.description || '',
        requestType: request.requestType,
        equipmentId: request.equipmentId,
        teamId: request.teamId || '',
        assignedToId: request.assignedToId || '',
        scheduledDate: request.scheduledDate 
          ? new Date(request.scheduledDate).toISOString().split('T')[0]
          : '',
        durationHours: request.durationHours || ('' as any),
      });
    }
  }, [request]);

  // Update request mutation
  const mutation = useMutation({
    mutationFn: async (data: Partial<RequestFormData>) => {
      // Convert date to ISO datetime format if provided
      const payload: any = {
        ...data,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString() : null,
        durationHours: data.durationHours || null,
      };
      
      // Remove fields that shouldn't be updated by certain roles
      if (!canEditFullDetails) {
        // Technicians and Users can only update description and scheduled date
        const restrictedPayload: any = {
          description: payload.description,
          scheduledDate: payload.scheduledDate,
        };
        
        // Users in NEW status can update more fields
        if (userRole === UserRole.USER && request?.status === RequestStatus.NEW) {
          restrictedPayload.subject = payload.subject;
          restrictedPayload.equipmentId = payload.equipmentId;
        }
        
        return api.patch(`/requests/${id}`, restrictedPayload);
      }
      
      return api.patch(`/requests/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request', id] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      alert('Request updated successfully!');
      router.push(`/requests/${id}`);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to update request';
      const errorDetails = error.response?.data?.details;
      
      if (errorDetails && Array.isArray(errorDetails)) {
        const newErrors: Record<string, string> = {};
        errorDetails.forEach((detail: any) => {
          if (detail.path && detail.path[0]) {
            newErrors[detail.path[0]] = detail.message;
          }
        });
        setErrors(newErrors);
        alert(errorMessage + '\n\nPlease check the form for errors.');
      } else {
        alert(errorMessage);
      }
    },
  });

  const handleChange = (field: keyof RequestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = requestSchema.parse({
        ...formData,
        durationHours: formData.durationHours ? Number(formData.durationHours) : undefined,
      });
      mutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0].toString()] = issue.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  if (requestLoading) {
    return <Loading text="Loading request..." />;
  }

  if (requestError || !request) {
    return <ErrorMessage message="Failed to load request" type="error" />;
  }

  if (!canEdit) {
    return (
      <div className="space-y-6">
        <ErrorMessage 
          message="You do not have permission to edit this request" 
          type="error" 
        />
        <Button onClick={() => router.push(`/requests/${id}`)}>
          Back to Request
        </Button>
      </div>
    );
  }

  const equipmentOptions = equipment.map(e => ({
    value: e.id,
    label: `${e.name} (${e.serialNumber})`,
  }));

  const teamOptions = [
    { value: '', label: 'No team assigned' },
    ...teams.map(t => ({
      value: t.id,
      label: t.name,
    })),
  ];

  const technicianOptions = [
    { value: '', label: 'No technician assigned' },
    ...teamMembers.map((member: any) => ({
      value: member.id,
      label: member.name,
    })),
  ];

  const requestTypeOptions = Object.values(RequestType).map(type => ({
    value: type,
    label: enumToDisplay(type),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push(`/requests/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Request</h1>
            <p className="mt-1 text-gray-600">
              Update maintenance request details
            </p>
          </div>
        </div>
      </div>

      {/* Permission Notice */}
      {!canEditFullDetails && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              {userRole === UserRole.USER 
                ? 'As a user, you can only edit description and scheduled date for NEW requests.'
                : 'As a technician, you can only edit description and scheduled date.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <Input
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Brief description of the issue"
                error={errors.subject}
                disabled={!canEditFullDetails && userRole !== UserRole.USER}
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detailed description of the maintenance request"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Request Type */}
            {canEditFullDetails && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request Type *
                </label>
                <Select
                  value={formData.requestType}
                  onChange={(e) => handleChange('requestType', e.target.value as RequestType)}
                  options={requestTypeOptions}
                  error={errors.requestType}
                />
                {errors.requestType && (
                  <p className="mt-1 text-sm text-red-600">{errors.requestType}</p>
                )}
              </div>
            )}

            {/* Equipment */}
            {(canEditFullDetails || (userRole === UserRole.USER && request.status === RequestStatus.NEW)) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment *
                </label>
                <Select
                  value={formData.equipmentId}
                  onChange={(e) => handleChange('equipmentId', e.target.value)}
                  options={equipmentOptions}
                  error={errors.equipmentId}
                />
                {errors.equipmentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.equipmentId}</p>
                )}
              </div>
            )}

            {/* Team Assignment (Managers/Admins only) */}
            {canAssignTeam && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maintenance Team
                </label>
                <Select
                  value={formData.teamId || ''}
                  onChange={(e) => {
                    handleChange('teamId', e.target.value);
                    handleChange('assignedToId', ''); // Reset technician when team changes
                  }}
                  options={teamOptions}
                />
              </div>
            )}

            {/* Technician Assignment (Managers/Admins only) */}
            {canAssignTeam && formData.teamId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Technician
                </label>
                <Select
                  value={formData.assignedToId || ''}
                  onChange={(e) => handleChange('assignedToId', e.target.value)}
                  options={technicianOptions}
                />
              </div>
            )}

            {/* Scheduled Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date
              </label>
              <Input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleChange('scheduledDate', e.target.value)}
                error={errors.scheduledDate}
              />
              {errors.scheduledDate && (
                <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>
              )}
            </div>

            {/* Duration Hours (for completed requests) */}
            {canEditFullDetails && request.status === RequestStatus.REPAIRED && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (hours)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.durationHours}
                  onChange={(e) => handleChange('durationHours', e.target.value)}
                  placeholder="e.g., 2.5"
                  error={errors.durationHours}
                />
                {errors.durationHours && (
                  <p className="mt-1 text-sm text-red-600">{errors.durationHours}</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={mutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/requests/${id}`)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
