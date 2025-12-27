'use client';

import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  color: 'gray' | 'blue' | 'green' | 'red';
  children: React.ReactNode;
}

const colorClasses = {
  gray: 'bg-gray-50 border-gray-200',
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  red: 'bg-red-50 border-red-200',
};

const badgeVariants = {
  gray: 'default' as const,
  blue: 'info' as const,
  green: 'success' as const,
  red: 'danger' as const,
};

export function KanbanColumn({ id, title, count, color, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full transition-all duration-200 ${
        isOver ? 'scale-105' : 'scale-100'
      }`}
    >
      <Card className={`flex-1 ${colorClasses[color]} ${
        isOver ? 'ring-2 ring-blue-500 shadow-lg' : ''
      } transition-all`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <Badge variant={badgeVariants[color]}>{count}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 min-h-[400px] max-h-[calc(100vh-300px)] overflow-y-auto">
          {count === 0 ? (
            <div className={`text-center py-8 ${
              isOver ? 'text-blue-600' : 'text-gray-400'
            } transition-colors`}>
              <p className="text-sm">{isOver ? 'Drop here' : 'No requests'}</p>
            </div>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </div>
  );
}
