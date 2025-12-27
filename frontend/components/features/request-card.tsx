'use client';

import { useDraggable } from '@dnd-kit/core';
import { useRouter } from 'next/navigation';
import { MaintenanceRequest } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Wrench, Clock, AlertCircle } from 'lucide-react';
import { enumToDisplay, formatDate } from '@/lib/utils';

interface RequestCardProps {
  request: MaintenanceRequest;
  isDragging?: boolean;
  canDrag?: boolean;
}

export function RequestCard({ request, isDragging = false, canDrag = true }: RequestCardProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: request.id,
    disabled: !canDrag,
  });

  // Check if request is overdue
  const isOverdue = request.scheduledDate && 
    new Date(request.scheduledDate) < new Date() && 
    !['REPAIRED', 'SCRAP'].includes(request.status);

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation when dragging
    if (!isDragging && canDrag) {
      router.push(`/requests/${request.id}`);
    } else if (!canDrag) {
      router.push(`/requests/${request.id}`);
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...(canDrag ? listeners : {})} 
      {...(canDrag ? attributes : {})}
    >
      <Card
        className={`${
          canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
        } hover:shadow-md transition-all duration-200 ${
          isDragging ? 'opacity-40' : ''
        } ${
          isOverdue ? 'border-2 border-red-500 bg-red-50' : ''
        }`}
        onClick={handleClick}
      >
        <CardContent className="pt-4 space-y-3">
          {/* Overdue Warning */}
          {isOverdue && (
            <div className="flex items-center gap-1 text-xs font-semibold text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>OVERDUE</span>
            </div>
          )}

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

          {/* Assigned Technician */}
          {request.assignedTo && (
            <div className="flex items-center gap-2 text-xs">
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                {request.assignedTo.name.charAt(0).toUpperCase()}
              </div>
              <span className="truncate text-gray-700 font-medium">
                {request.assignedTo.name}
              </span>
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
            <div className={`flex items-center text-xs ${
              isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'
            }`}>
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
