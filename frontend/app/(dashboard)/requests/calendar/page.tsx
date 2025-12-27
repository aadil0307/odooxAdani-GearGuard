'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import api from '@/lib/api-client';
import { MaintenanceRequest, RequestType, ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { Plus, List, Columns3 } from 'lucide-react';

// Lazy load FullCalendar to reduce initial bundle size (saves ~100KB)
const FullCalendar = dynamic(() => import('@fullcalendar/react'), {
  loading: () => (
    <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
      <Loading text="Loading calendar..." />
    </div>
  ),
  ssr: false,
});

// Import plugins normally (they're small and needed by FullCalendar)
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function CalendarPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const { data: response, isLoading, error } = useQuery<ApiResponse<{ requests: MaintenanceRequest[]; pagination: any }>>({
    queryKey: ['requests'],
    queryFn: () => api.get('/requests'),
  });

  const requests = (response?.success && response?.data?.requests) ? response.data.requests : [];

  // Memoize events to avoid transformation on every render
  // Calendar shows only PREVENTIVE maintenance requests
  const events = useMemo(() => 
    requests
      .filter(r => r.requestType === RequestType.PREVENTIVE && r.scheduledDate)
      .map(r => ({
        id: r.id,
        title: r.subject,
        date: r.scheduledDate!,
        backgroundColor: '#10b981',
        borderColor: '#059669',
        extendedProps: {
          status: r.status,
          team: r.team?.name,
          assignedTo: r.assignedTo?.name,
        },
      }))
  , [requests]);

  // Memoize event handlers to prevent recreation on every render
  const handleEventClick = useCallback((info: any) => {
    router.push(`/requests/${info.event.id}`);
  }, [router]);

  const handleDateClick = useCallback((info: any) => {
    router.push(`/requests/new?date=${info.dateStr}`);
  }, [router]);

  if (isLoading) {
    return <Loading text="Loading calendar..." />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load calendar" type="error" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar View</h1>
          <p className="mt-1 text-gray-600">
            Schedule and view maintenance requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/requests')}>
            <List className="mr-2 h-4 w-4" />
            List View
          </Button>
          <Button variant="outline" onClick={() => router.push('/requests/kanban')}>
            <Columns3 className="mr-2 h-4 w-4" />
            Kanban
          </Button>
          {userRole !== 'TECHNICIAN' && (
            <Button onClick={() => router.push('/requests/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <div>
            <p className="text-sm font-semibold text-blue-900">Preventive Maintenance Schedule</p>
            <p className="text-xs text-blue-700 mt-0.5">
              This calendar displays only scheduled preventive maintenance. Click any date to create a new request.
            </p>
          </div>
        </div>
      </Card>

      {/* Calendar */}
      <Card className="p-6">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay',
          }}
          height="auto"
          eventDisplay="block"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
          }}
        />
      </Card>
    </div>
  );
}
