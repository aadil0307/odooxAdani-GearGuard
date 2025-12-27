'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import api from '@/lib/api-client';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, X } from 'lucide-react';

const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

export default function NewTeamPage() {
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
      alert('You do not have permission to create teams');
      router.push('/teams');
    }
  }, [session, canManage, router]);

  // Create mutation
  const mutation = useMutation({
    mutationFn: async (data: TeamFormData) => {
      return api.post('/teams', data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      const teamId = response.data?.id;
      if (teamId) {
        router.push(`/teams/${teamId}`);
      } else {
        router.push('/teams');
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to create team');
    },
  });

  const handleChange = (field: keyof TeamFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!canManage) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Team</h1>
          <p className="mt-1 text-gray-600">Add a new maintenance team</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Team Name *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Electrical Team"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the team's responsibilities..."
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.isActive ?? true}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Team is active
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                {mutation.isPending ? 'Creating...' : 'Create Team'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={mutation.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
