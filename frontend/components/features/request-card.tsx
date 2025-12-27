'use client';

import { useDraggable } from '@dnd-kit/core';
import { useRouter } from 'next/navigation';
import { MaintenanceRequest } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Wrench, Clock } from 'lucide-react';
import { enumToDisplay, formatDate } from '@/lib/utils';

interface RequestCardProps {
  request: MaintenanceRequest;
  isDragging?: boolean;
}

export function RequestCard({ request, isDragging = false }: RequestCardProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: request.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        cursor: 'grabbing',
      }
    : undefined;

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      router.push(`/requests/${request.id}`);
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card
        className={`cursor-grab hover:shadow-md transition-shadow ${
          isDragging ? 'opacity-50' : ''
        }`}
        onClick={handleClick}
      >
        <CardContent className="pt-4 space-y-3">
          {/* Title */}
          <div>
            <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
              {request.subject}
            </h4>
          </div>

          {/* Request Type Badge */}
          <div>
            <Badge variant="info" className="text-xs">
              {enumToDisplay(request.requestType)}
            </Badge>
          </div>

          {/* Equipment */}
          {request.equipment && (
            <div className="flex items-center text-xs text-gray-600">
              <Wrench className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{request.equipment.name}</span>
            </div>
          )}

          {/* Team */}
          {request.team && (
            <div className="flex items-center text-xs text-gray-600">
              <User className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{request.team.name}</span>
            </div>
          )}

          {/* Scheduled Date */}
          {request.scheduledDate && (
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>{formatDate(request.scheduledDate)}</span>
            </div>
          )}

          {/* Duration */}
          {request.durationHours && (
            <div className="flex items-center text-xs text-gray-600">
              <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>{request.durationHours}h</span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2 border-t text-xs text-gray-500">
            Created {formatDate(request.createdAt)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
