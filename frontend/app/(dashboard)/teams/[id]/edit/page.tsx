'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import api from '@/lib/api-client';
import { MaintenanceTeam, ApiResponse, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { ArrowLeft, Save, X } from 'lucide-react';

const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditTeamPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const [formData, setFormData] = useState<Partial<TeamFormData>>({
    name: '',
    description: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const userRole = session?.user?.role;
  const canManage = userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;

  // Redirect if not authorized
  useEffect(() => {
    if (session && !canManage) {
      alert('You do not have permission to edit teams');
      router.push('/teams');
    }
  }, [session, canManage, router]);

  // Fetch team details
  const { data: response, isLoading, error } = useQuery<ApiResponse<MaintenanceTeam>>({
    queryKey: ['teams', id],
    queryFn: () => api.get(`/teams/${id}`),
  });

  const team = response?.data;

  // Populate form when team data loads
  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        description: team.description || '',
        isActive: team.isActive,
      });
    }
  }, [team]);

  // Update mutation
  const mutation = useMutation({
    mutationFn: async (data: TeamFormData) => {
      return api.put(`/teams/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      router.push(`/teams/${id}`);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update team');
    },
  });

  const handleChange = (field: keyof TeamFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = teamSchema.parse(formData);
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

  if (isLoading) {
    return <Loading text="Loading team details..." />;
  }

  if (error || !team) {
    return <ErrorMessage message="Failed to load team details" type="error" />;
  }

  if (!canManage) {
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Team</h1>
          <p className="mt-1 text-gray-600">Update team information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Team Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <Input
                label="Team Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                placeholder="e.g., Electrical Team"
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
                  placeholder="Brief description of team responsibilities..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Team is active
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button type="submit" disabled={mutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
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
