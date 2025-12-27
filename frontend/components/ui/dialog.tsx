'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative z-50 w-full max-w-lg mx-4">
        {children}
      </div>
    </div>
  );
};

const DialogContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-xl', className)}>
      {children}
    </div>
  );
};

const DialogHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn('flex items-start justify-between p-6 border-b', className)}>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

const DialogTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <h2 className={cn('text-xl font-semibold text-gray-900', className)}>
      {children}
    </h2>
  );
};

const DialogFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn('flex items-center justify-end gap-2 p-6 border-t bg-gray-50', className)}>
      {children}
    </div>
  );
};

Dialog.displayName = 'Dialog';
DialogContent.displayName = 'DialogContent';
DialogHeader.displayName = 'DialogHeader';
DialogTitle.displayName = 'DialogTitle';
DialogFooter.displayName = 'DialogFooter';

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter };
