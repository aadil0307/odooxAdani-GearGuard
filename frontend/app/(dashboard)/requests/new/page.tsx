'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import api from '@/lib/api-client';
import {
  Equipment,
  MaintenanceTeam,
  RequestType,
  ApiResponse,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { ArrowLeft, Save, X } from 'lucide-react';
import { enumToDisplay } from '@/lib/utils';

const requestSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  requestType: z.nativeEnum(RequestType),
  equipmentId: z.string().min(1, 'Equipment is required'),
  teamId: z.string().optional(),
  scheduledDate: z.string().optional(),
  durationHours: z.number().min(0).optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function NewRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  // Redirect technicians - they cannot create requests
  useEffect(() => {
    if (userRole === 'TECHNICIAN') {
      alert('Technicians cannot create maintenance requests');
      router.push('/requests');
    }
  }, [userRole, router]);

  const equipmentIdParam = searchParams.get('equipmentId');
  const dateParam = searchParams.get('date');

  const [formData, setFormData] = useState<Partial<RequestFormData>>({
    subject: '',
    description: '',
    requestType: RequestType.CORRECTIVE,
    equipmentId: equipmentIdParam || '',
    teamId: '',
    scheduledDate: dateParam || '',
    durationHours: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch equipment list
  const { data: equipmentResponse } = useQuery<ApiResponse<{ equipment: Equipment[]; pagination: any }>>({
    queryKey: ['equipment'],
    queryFn: () => api.get('/equipment'),
  });

  const equipment = (equipmentResponse?.success && equipmentResponse?.data?.equipment) 
    ? equipmentResponse.data.equipment 
    : [];

  // Fetch teams list
  const { data: teamsResponse } = useQuery<ApiResponse<MaintenanceTeam[]>>({
    queryKey: ['teams'],
    queryFn: () => api.get('/teams'),
  });

  const teams = teamsResponse?.data || [];

  // Auto-fill team when equipment is selected
  useEffect(() => {
    if (formData.equipmentId) {
      const selectedEquipment = equipment.find(e => e.id === formData.equipmentId);
      if (selectedEquipment?.defaultTeamId) {
        setFormData(prev => ({ ...prev, teamId: selectedEquipment.defaultTeamId }));
      }
    }
  }, [formData.equipmentId, equipment]);

  // Create request mutation
  const mutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      return api.post('/requests', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      router.push('/requests');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to create request');
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

  const equipmentOptions = equipment.map(e => ({
    value: e.id,
    label: `${e.name} (${e.serialNumber})`,
  }));

  const teamOptions = [
    { value: '', label: 'Auto-assign (recommended)' },
    ...teams.map(t => ({
      value: t.id,
      label: t.name,
    })),
  ];

  const requestTypeOptions = useMemo(() => {
    const allTypes = Object.values(RequestType).map(type => ({
      value: type,
      label: enumToDisplay(type),
    }));
    
    // Users can only create CORRECTIVE requests
    if (userRole === 'USER') {
      return allTypes.filter(type => type.value === RequestType.CORRECTIVE);
    }
    
    // Managers and Admins can create both types
    return allTypes;
  }, [userRole]);

  // Show loading while checking role
  if (!userRole) {
    return <Loading text="Loading..." />;
  }

  // Technicians redirected by useEffect
  if (userRole === 'TECHNICIAN') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Maintenance Request</h1>
          <p className="mt-1 text-gray-600">Create a new maintenance request</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <Input
                label="Subject"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                error={errors.subject}
                placeholder="Brief description of the issue"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Detailed description of the issue..."
                />
              </div>

              <Select
                label="Request Type"
                value={formData.requestType}
                onChange={(e) => handleChange('requestType', e.target.value)}
                options={requestTypeOptions}
                error={errors.requestType}
                required
              />
            </div>

            {/* Equipment & Team */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-medium text-gray-900">Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Equipment"
                  value={formData.equipmentId}
                  onChange={(e) => handleChange('equipmentId', e.target.value)}
                  options={equipmentOptions}
                  error={errors.equipmentId}
                  required
                />
                <Select
                  label="Maintenance Team"
                  value={formData.teamId}
                  onChange={(e) => handleChange('teamId', e.target.value)}
                  options={teamOptions}
                />
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-medium text-gray-900">Scheduling</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Scheduled Date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleChange('scheduledDate', e.target.value)}
                  placeholder="Optional"
                />
                <Input
                  type="number"
                  label="Estimated Duration (hours)"
                  value={formData.durationHours}
                  onChange={(e) => handleChange('durationHours', e.target.value)}
                  placeholder="Optional"
                  step="0.5"
                  min="0"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-6 border-t">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creating...' : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Request
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={mutation.isPending}
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
