'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import api from '@/lib/api-client';
import { MaintenanceRequest, RequestStatus, ApiResponse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KanbanColumn } from '@/components/features/kanban-column';
import { RequestCard } from '@/components/features/request-card';
import { Plus, Filter } from 'lucide-react';
import { enumToDisplay } from '@/lib/utils';

export default function KanbanPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;
  const [activeRequest, setActiveRequest] = useState<MaintenanceRequest | null>(null);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ id: string; status: RequestStatus } | null>(null);
  const [durationHours, setDurationHours] = useState<string>('');

  // Check if user can drag a specific request
  const canDragRequest = useCallback((request: MaintenanceRequest) => {
    // USERs cannot change status
    if (userRole === 'USER') return false;
    if (userRole === 'ADMIN' || userRole === 'MANAGER') return true;
    if (userRole === 'TECHNICIAN' && request.assignedToId === userId) return true;
    return false;
  }, [userRole, userId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch all requests
  const { data: response, isLoading, error } = useQuery<ApiResponse<{ requests: MaintenanceRequest[]; pagination: any }>>({
    queryKey: ['requests'],
    queryFn: () => api.get('/requests'),
  });

  const requests = (response?.success && response?.data?.requests) ? response.data.requests : [];

  // Update request status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, durationHours }: { id: string; status: RequestStatus; durationHours?: number }) => {
      return api.patch(`/requests/${id}/status`, { status, durationHours });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update request status');
    },
  });

  // Memoize grouped columns to avoid filtering on every render
  const columns = useMemo(() => ({
    [RequestStatus.NEW]: requests.filter(r => r.status === RequestStatus.NEW),
    [RequestStatus.IN_PROGRESS]: requests.filter(r => r.status === RequestStatus.IN_PROGRESS),
    [RequestStatus.REPAIRED]: requests.filter(r => r.status === RequestStatus.REPAIRED),
    [RequestStatus.SCRAP]: requests.filter(r => r.status === RequestStatus.SCRAP),
  }), [requests]);

  // Memoize drag handlers to prevent recreation on every render
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const request = requests.find(r => r.id === event.active.id);
    if (request) {
      setActiveRequest(request);
    }
  }, [requests]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveRequest(null);

    if (!over || active.id === over.id) return;

    const requestId = active.id as string;
    const newStatus = over.id as RequestStatus;

    // If marking as REPAIRED, show duration dialog
    if (newStatus === RequestStatus.REPAIRED) {
      setPendingStatusUpdate({ id: requestId, status: newStatus });
      return;
    }

    // Update request status
    updateStatusMutation.mutate({ id: requestId, status: newStatus });
  }, [updateStatusMutation]);

  const handleConfirmRepaired = () => {
    if (pendingStatusUpdate && durationHours) {
      const hours = parseFloat(durationHours);
      if (hours > 0) {
        updateStatusMutation.mutate({ 
          id: pendingStatusUpdate.id, 
          status: pendingStatusUpdate.status,
          durationHours: hours
        });
        setPendingStatusUpdate(null);
        setDurationHours('');
      } else {
        alert('Please enter a valid duration in hours');
      }
    }
  };

  const handleCancelRepaired = () => {
    setPendingStatusUpdate(null);
    setDurationHours('');
  };

  if (isLoading) {
    return <Loading text="Loading requests..." />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load requests" type="error" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
          <p className="mt-1 text-gray-600">
            Drag and drop requests to update their status
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/requests')}>
            <Filter className="mr-2 h-4 w-4" />
            List View
          </Button>
          {userRole !== 'TECHNICIAN' && (
            <Button onClick={() => router.push('/requests/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {columns[RequestStatus.NEW].length}
              </p>
              <p className="text-sm text-gray-600 mt-1">New Requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {columns[RequestStatus.IN_PROGRESS].length}
              </p>
              <p className="text-sm text-gray-600 mt-1">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {columns[RequestStatus.REPAIRED].length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Repaired</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {columns[RequestStatus.SCRAP].length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Scrapped</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-4">
          <KanbanColumn
            id={RequestStatus.NEW}
            title="New"
            count={columns[RequestStatus.NEW].length}
            color="gray"
          >
            {columns[RequestStatus.NEW].map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                canDrag={canDragRequest(request)}
              />
            ))}
          </KanbanColumn>

          <KanbanColumn
            id={RequestStatus.IN_PROGRESS}
            title="In Progress"
            count={columns[RequestStatus.IN_PROGRESS].length}
            color="blue"
          >
            {columns[RequestStatus.IN_PROGRESS].map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                canDrag={canDragRequest(request)}
              />
            ))}
          </KanbanColumn>

          <KanbanColumn
            id={RequestStatus.REPAIRED}
            title="Repaired"
            count={columns[RequestStatus.REPAIRED].length}
            color="green"
          >
            {columns[RequestStatus.REPAIRED].map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                canDrag={canDragRequest(request)}
              />
            ))}
          </KanbanColumn>

          <KanbanColumn
            id={RequestStatus.SCRAP}
            title="Scrapped"
            count={columns[RequestStatus.SCRAP].length}
            color="red"
          >
            {columns[RequestStatus.SCRAP].map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                canDrag={false}
              />
            ))}
          </KanbanColumn>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeRequest ? (
            <div style={{ transform: 'rotate(3deg)' }}>
              <RequestCard request={activeRequest} isDragging canDrag={false} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Duration Dialog */}
      <Dialog open={!!pendingStatusUpdate} onOpenChange={(open: boolean) => !open && handleCancelRepaired()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Request as Repaired</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours) *</Label>
              <Input
                id="duration"
                type="number"
                step="0.5"
                min="0.5"
                placeholder="e.g., 2.5"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmRepaired();
                  }
                }}
              />
              <p className="text-sm text-gray-600">
                Enter the time spent repairing this equipment
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelRepaired}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRepaired} disabled={!durationHours}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
