'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api-client';
import { UserRole, ApiResponse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { Users, Shield, UserCog, User, CheckCircle, XCircle } from 'lucide-react';
import { enumToDisplay, formatDate } from '@/lib/utils';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UserManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Redirect if not admin
  if (session?.user?.role !== UserRole.ADMIN) {
    router.push('/dashboard');
    return null;
  }

  // Fetch all users
  const { data: response, isLoading, error } = useQuery<ApiResponse<UserData[]>>({
    queryKey: ['users'],
    queryFn: () => api.get('/users'),
  });

  const users = (response?.success && Array.isArray(response?.data)) ? response.data : [];

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      api.patch(`/users/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedUserId(null);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update user role');
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (userId: string) => api.patch(`/users/${userId}/status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to toggle user status');
    },
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (confirm(`Are you sure you want to change this user's role to ${enumToDisplay(newRole)}?`)) {
      updateRoleMutation.mutate({ userId, role: newRole });
    }
  };

  const handleToggleStatus = (userId: string) => {
    if (confirm('Are you sure you want to toggle this user\'s status?')) {
      toggleStatusMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return <Loading text="Loading users..." />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load users" type="error" />;
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return Shield;
      case UserRole.MANAGER:
        return UserCog;
      default:
        return User;
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'danger' as const;
      case UserRole.MANAGER:
        return 'warning' as const;
      case UserRole.TECHNICIAN:
        return 'info' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-gray-600">
          Manage user roles and permissions (Admin Only)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {users.filter(u => u.role === UserRole.ADMIN).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Managers</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {users.filter(u => u.role === UserRole.MANAGER).length}
                </p>
              </div>
              <UserCog className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold text-gray-700">User</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Current Role</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Joined</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  const isCurrentUser = user.id === session?.user?.id;

                  return (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <RoleIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-blue-600">(You)</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{user.email}</td>
                      <td className="p-4">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {enumToDisplay(user.role)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={user.isActive ? 'success' : 'default'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="p-4">
                        {!isCurrentUser && (
                          <div className="flex gap-2">
                            {/* Role Selection */}
                            {selectedUserId === user.id ? (
                              <div className="flex gap-1 flex-wrap">
                                {Object.values(UserRole).map((role) => {
                                  const isCurrentRole = user.role === role;
                                  return (
                                    <Button
                                      key={role}
                                      size="sm"
                                      variant={isCurrentRole ? 'primary' : 'outline'}
                                      onClick={() => handleRoleChange(user.id, role)}
                                      disabled={updateRoleMutation.isPending}
                                      className="text-xs"
                                    >
                                      {enumToDisplay(role)}
                                    </Button>
                                  );
                                })}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedUserId(null)}
                                  className="text-xs"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedUserId(user.id)}
                                >
                                  Change Role
                                </Button>
                                <Button
                                  size="sm"
                                  variant={user.isActive ? 'danger' : 'primary'}
                                  onClick={() => handleToggleStatus(user.id)}
                                  disabled={toggleStatusMutation.isPending}
                                >
                                  {user.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
              <p className="mt-2 text-sm text-gray-500">Start by creating some users</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">Role Management Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li><strong>USER:</strong> Can create breakdown requests and view own requests</li>
                <li><strong>TECHNICIAN:</strong> Can work on requests and view team requests</li>
                <li><strong>MANAGER:</strong> Can create preventive requests, assign technicians, and view all requests</li>
                <li><strong>ADMIN:</strong> Full system access including user management</li>
                <li className="text-red-600 font-semibold mt-2">⚠️ Only ADMIN can promote users to MANAGER or ADMIN roles</li>
                <li className="text-red-600 font-semibold">⚠️ New users can only register as USER or TECHNICIAN</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
