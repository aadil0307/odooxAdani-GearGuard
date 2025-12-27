'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import api from '@/lib/api-client';
import { MaintenanceRequest, MaintenanceTeam, ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, User, Wrench } from 'lucide-react';
import { enumToDisplay, formatDate } from '@/lib/utils';

export default function PendingRequestsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const [approvingRequest, setApprovingRequest] = useState<MaintenanceRequest | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');

  // Redirect if not manager/admin
  if (userRole && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
    router.push('/requests');
    return null;
  }

  // Fetch pending requests
  const { data: response, isLoading, error } = useQuery<ApiResponse<{ requests: MaintenanceRequest[]; pagination: any }>>({
    queryKey: ['requests', 'pending'],
    queryFn: () => api.get('/requests?isPending=true'),
  });

  const pendingRequests = (response?.success && response?.data?.requests) ? response.data.requests : [];

  // Fetch teams
  const { data: teamsResponse } = useQuery<ApiResponse<MaintenanceTeam[]>>({
    queryKey: ['teams'],
    queryFn: () => api.get('/teams'),
  });

  const teams = teamsResponse?.data || [];

  // Fetch team members when a team is selected
  const { data: teamMembersResponse } = useQuery({
    queryKey: ['team', selectedTeamId, 'members'],
    queryFn: () => api.get(`/teams/${selectedTeamId}`),
    enabled: !!selectedTeamId,
  });

  const teamMembers = teamMembersResponse?.data?.members || [];

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ requestId, teamId, technicianId }: { requestId: string; teamId: string; technicianId?: string }) => {
      return api.post(`/requests/${requestId}/approve`, { 
        teamId, 
        assignedToId: technicianId || null 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      alert('Request approved successfully!');
      setApprovingRequest(null);
      setSelectedTeamId('');
      setSelectedTechnicianId('');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to approve request');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return api.post(`/requests/${requestId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      alert('Request rejected successfully');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to reject request');
    },
  });

  const handleApproveClick = (request: MaintenanceRequest) => {
    setApprovingRequest(request);
    setSelectedTeamId(request.teamId || '');
    setSelectedTechnicianId('');
  };

  const handleConfirmApprove = () => {
    if (approvingRequest && selectedTeamId) {
      approveMutation.mutate({
        requestId: approvingRequest.id,
        teamId: selectedTeamId,
        technicianId: selectedTechnicianId || undefined,
      });
    } else {
      alert('Please select a maintenance team');
    }
  };

  const handleReject = (requestId: string) => {
    if (confirm('Are you sure you want to reject this request?')) {
      rejectMutation.mutate(requestId);
    }
  };

  if (isLoading) {
    return <Loading text="Loading pending requests..." />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load pending requests" type="error" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="mt-1 text-gray-600">
          Review and approve maintenance requests created by users
        </p>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-orange-600">
              {pendingRequests.length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Pending Requests</p>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests List */}
      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium text-gray-900">All caught up!</p>
            <p className="text-gray-600 mt-1">No pending requests to review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{request.subject}</CardTitle>
                      <Badge variant="warning" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Approval
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Requested by {request.createdBy?.name} on {formatDate(request.createdAt)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                {request.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Description:</p>
                    <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Request Type</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {enumToDisplay(request.requestType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Equipment</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Wrench className="h-4 w-4 text-gray-600" />
                      <p className="text-sm font-semibold text-gray-900">
                        {request.equipment?.name}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Scheduled Date</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {request.scheduledDate ? formatDate(request.scheduledDate) : 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleApproveClick(request)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve & Assign
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(request.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="border-red-300 hover:bg-red-50 hover:text-red-700"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/requests/${request.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approval Dialog */}
      <Dialog open={!!approvingRequest} onOpenChange={(open: boolean) => !open && setApprovingRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request & Assign Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-gray-700 mb-4">
                <strong>Request:</strong> {approvingRequest?.subject}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Maintenance Team *</Label>
              <Select
                id="team"
                value={selectedTeamId}
                onChange={(e) => {
                  setSelectedTeamId(e.target.value);
                  setSelectedTechnicianId(''); // Reset technician when team changes
                }}
                options={[
                  { value: '', label: 'Select a team...' },
                  ...teams.map(t => ({
                    value: t.id,
                    label: t.name,
                  })),
                ]}
              />
            </div>

            {selectedTeamId && (
              <div className="space-y-2">
                <Label htmlFor="technician">Assigned Technician (Optional)</Label>
                <Select
                  id="technician"
                  value={selectedTechnicianId}
                  onChange={(e) => setSelectedTechnicianId(e.target.value)}
                  options={[
                    { value: '', label: 'No technician assigned' },
                    ...teamMembers.map((member: any) => ({
                      value: member.id,
                      label: member.name,
                    })),
                  ]}
                />
                <p className="text-xs text-gray-600">
                  You can assign a specific technician or leave unassigned for the team to decide
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovingRequest(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmApprove} 
              disabled={!selectedTeamId || approveMutation.isPending}
            >
              {approveMutation.isPending ? 'Approving...' : 'Approve Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
