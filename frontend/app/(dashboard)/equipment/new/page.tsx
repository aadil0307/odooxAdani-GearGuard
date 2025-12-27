'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EquipmentForm } from '@/components/features/equipment-form';

export default function NewEquipmentPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Equipment</h1>
          <p className="mt-1 text-gray-600">Register a new equipment in the system</p>
        </div>
      </div>

      {/* Form */}
      <EquipmentForm />
    </div>
  );
}
