'use client';

import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api-client';
import { MaintenanceTeam, User as UserType, ApiResponse, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { Select } from '@/components/ui/select';
import { ArrowLeft, Edit, Trash2, User, UserPlus, X } from 'lucide-react';

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  
  // Unwrap params Promise (Next.js 15+)
  const { id } = use(params);

  const userRole = session?.user?.role;
  const canManage = userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;
  const canDelete = userRole === UserRole.ADMIN; // Only admins can delete teams

  const { data: response, isLoading, error } = useQuery<ApiResponse<MaintenanceTeam>>({
    queryKey: ['teams', id],
    queryFn: () => api.get(`/teams/${id}`),
  });

  const team = response?.data;

  // Fetch all users to get technicians
  const { data: usersResponse } = useQuery<ApiResponse<UserType[]>>({
    queryKey: ['users'],
    queryFn: () => api.get('/users'),
    enabled: canManage, // Only fetch if user can manage teams
  });

  const allUsers = usersResponse?.data || [];

  // Filter technicians and categorize them
  const { availableTechnicians, techniciansInTeam, techniciansInOtherTeams } = useMemo(() => {
    const teamMemberIds = team?.members.map(m => m.id) || [];
    
    const available: UserType[] = [];
    const inTeam: UserType[] = [];
    const inOther: UserType[] = [];

    allUsers.forEach(user => {
      if (user.role === UserRole.TECHNICIAN) {
        if (teamMemberIds.includes(user.id)) {
          inTeam.push(user);
        } else if (user.teams && user.teams.length > 0) {
          inOther.push(user);
        } else {
          available.push(user);
        }
      }
    });

    return {
      availableTechnicians: available,
      techniciansInTeam: inTeam,
      techniciansInOtherTeams: inOther,
    };
  }, [allUsers, team?.members]);

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/teams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      router.push('/teams');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to delete team');
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => api.post(`/teams/${id}/members`, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowAddMember(false);
      setSelectedUserId('');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to add member');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/teams/${id}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to remove member');
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

  const handleAddMember = () => {
    if (selectedUserId) {
      addMemberMutation.mutate(selectedUserId);
    }
  };

  const handleRemoveMember = (userId: string) => {
    if (
      confirm(
        'Remove this member from the team?\n\nNote: Any active requests assigned to this member will be automatically unassigned but will remain with the team.'
      )
    ) {
      removeMemberMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return <Loading text="Loading team details..." />;
  }

  if (error || !team) {
    return <ErrorMessage message="Failed to load team details" type="error" />;
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
            <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
            <p className="mt-1 text-gray-600">{team.members.length} team members</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <Button variant="outline" onClick={() => router.push(`/teams/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {showDeleteConfirm ? 'Confirm Delete?' : 'Delete'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team Members ({team?.members.length || 0})</CardTitle>
                {canManage && (
                  <Button
                    size="sm"
                    onClick={() => setShowAddMember(true)}
                    disabled={!usersResponse || (availableTechnicians.length === 0 && techniciansInOtherTeams.length === 0)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showAddMember && canManage && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Add Technician to Team</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAddMember(false);
                        setSelectedUserId('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {availableTechnicians.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available Technicians
                        </label>
                        <Select
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          options={[
                            { value: '', label: 'Select a technician...' },
                            ...availableTechnicians.map(u => ({
                              value: u.id,
                              label: `${u.name} (${u.email})`,
                            })),
                          ]}
                        />
                      </div>
                    )}
                    {techniciansInOtherTeams.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Technicians in Other Teams
                        </label>
                        <Select
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          options={[
                            { value: '', label: 'Select a technician...' },
                            ...techniciansInOtherTeams.map(u => ({
                              value: u.id,
                              label: `${u.name} (${u.email}) - Already in team`,
                            })),
                          ]}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Note: Technicians can be in multiple teams
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddMember}
                        disabled={!selectedUserId || addMemberMutation.isPending}
                      >
                        {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddMember(false);
                          setSelectedUserId('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {team?.members.length === 0 ? (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No team members
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Add technicians to this team to assign maintenance requests
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="info">{member.role}</Badge>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={removeMemberMutation.isPending}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Team Info & Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-900">
                  {team?.description || 'No description provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <Badge variant={team?.isActive ? 'success' : 'default'}>
                  {team?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Members</span>
                <span className="font-semibold text-gray-900">{team?.members.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Requests</span>
                <span className="font-semibold text-gray-900">{team?._count?.maintenanceRequests || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Equipment Assigned</span>
                <span className="font-semibold text-gray-900">{team?._count?.defaultForEquipment || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
