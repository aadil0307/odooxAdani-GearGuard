'use client';

import { use } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import api from '@/lib/api-client';
import { Equipment, ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { EquipmentForm } from '@/components/features/equipment-form';

export default function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  
  // Unwrap params Promise (Next.js 15+)
  const { id } = use(params);

  // Fetch equipment details
  const { data: response, isLoading, error } = useQuery<ApiResponse<Equipment>>({
    queryKey: ['equipment', id],
    queryFn: () => api.get(`/equipment/${id}`),
  });

  const equipment = response?.data;

  if (isLoading) {
    return <Loading text="Loading equipment..." />;
  }

  if (error || !equipment) {
    return <ErrorMessage message="Failed to load equipment" type="error" />;
  }

  // Restrict access for USERs
  if (session?.user?.role === 'USER') {
    return (
      <div className="space-y-6">
        <ErrorMessage 
          message="Access Denied: Only administrators, managers, and technicians can edit equipment details." 
          type="error" 
        />
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
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
