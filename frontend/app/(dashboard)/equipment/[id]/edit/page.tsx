'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api-client';
import { Equipment, ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { EquipmentForm } from '@/components/features/equipment-form';

export default function EditEquipmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  // Fetch equipment details
  const { data: response, isLoading, error } = useQuery<ApiResponse<Equipment>>({
    queryKey: ['equipment', params.id],
    queryFn: () => api.get(`/equipment/${params.id}`),
  });

  const equipment = response?.data;

  if (isLoading) {
    return <Loading text="Loading equipment..." />;
  }

  if (error || !equipment) {
    return <ErrorMessage message="Failed to load equipment" type="error" />;
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Edit Equipment</h1>
          <p className="mt-1 text-gray-600">{equipment.name}</p>
        </div>
      </div>

      {/* Form */}
      <EquipmentForm equipment={equipment} />
    </div>
  );
}
