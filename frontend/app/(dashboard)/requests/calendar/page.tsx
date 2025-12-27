'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '@/lib/api-client';
import { MaintenanceRequest, RequestType, ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { Plus, List, Columns3 } from 'lucide-react';

export default function CalendarPage() {
  const router = useRouter();

  const { data: response, isLoading, error } = useQuery<ApiResponse<MaintenanceRequest[]>>({
    queryKey: ['requests'],
    queryFn: () => api.get('/requests'),
  });

  const requests = (response?.success && Array.isArray(response?.data)) ? response.data : [];

  // Convert requests to calendar events
  const events = requests
    .filter(r => r.scheduledDate)
    .map(r => ({
      id: r.id,
      title: r.subject,
      date: r.scheduledDate!,
      backgroundColor: r.requestType === RequestType.PREVENTIVE ? '#10b981' : '#f59e0b',
      borderColor: r.requestType === RequestType.PREVENTIVE ? '#059669' : '#d97706',
    }));

  const handleEventClick = (info: any) => {
    router.push(`/requests/${info.event.id}`);
  };

  const handleDateClick = (info: any) => {
    router.push(`/requests/new?date=${info.dateStr}`);
  };

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
          <Button onClick={() => router.push('/requests/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-700">Preventive Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm text-gray-700">Corrective Maintenance</span>
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
            right: 'dayGridMonth,dayGridWeek',
          }}
          height="auto"
          eventDisplay="block"
        />
      </Card>
    </div>
  );
}
