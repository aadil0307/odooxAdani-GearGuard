'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import api from '@/lib/api-client';
import { Equipment, EquipmentCategory, Department } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X } from 'lucide-react';
import { enumToDisplay } from '@/lib/utils';

const equipmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  category: z.nativeEnum(EquipmentCategory),
  department: z.nativeEnum(Department),
  physicalLocation: z.string().min(1, 'Location is required'),
  assignedEmployeeName: z.string().optional(),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  warrantyExpiry: z.string().optional(),
  notes: z.string().optional(),
  isScrap: z.boolean().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface EquipmentFormProps {
  equipment?: Equipment;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EquipmentForm({ equipment, onSuccess, onCancel }: EquipmentFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!equipment;

  const [formData, setFormData] = useState<Partial<EquipmentFormData>>({
    name: equipment?.name || '',
    serialNumber: equipment?.serialNumber || '',
    category: equipment?.category || EquipmentCategory.MECHANICAL,
    department: equipment?.department || Department.PRODUCTION,
    physicalLocation: equipment?.physicalLocation || '',
    assignedEmployeeName: equipment?.assignedEmployeeName || '',
    purchaseDate: equipment?.purchaseDate ? new Date(equipment.purchaseDate).toISOString().split('T')[0] : '',
    warrantyExpiry: equipment?.warrantyExpiry ? new Date(equipment.warrantyExpiry).toISOString().split('T')[0] : '',
    notes: equipment?.notes || '',
    isScrap: equipment?.isScrap || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async (data: EquipmentFormData) => {
      if (isEditing) {
        return api.put(`/equipment/${equipment.id}`, data);
      }
      return api.post('/equipment', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/equipment');
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to save equipment');
    },
  });

  const handleChange = (field: keyof EquipmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = equipmentSchema.parse(formData);
      mutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0].toString()] = issue.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const categoryOptions = Object.values(EquipmentCategory).map(cat => ({
    value: cat,
    label: enumToDisplay(cat),
  }));

  const departmentOptions = Object.values(Department).map(dept => ({
    value: dept,
    label: enumToDisplay(dept),
  }));

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Equipment' : 'Add New Equipment'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Equipment Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                required
              />
              <Input
                label="Serial Number"
                value={formData.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
                error={errors.serialNumber}
                required
              />
              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                options={categoryOptions}
                error={errors.category}
                required
              />
              <Select
                label="Department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                options={departmentOptions}
                error={errors.department}
                required
              />
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-900">Location & Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Physical Location"
                value={formData.physicalLocation}
                onChange={(e) => handleChange('physicalLocation', e.target.value)}
                error={errors.physicalLocation}
                placeholder="e.g., Building A, Floor 2"
                required
              />
              <Input
                label="Assigned Employee Name"
                value={formData.assignedEmployeeName}
                onChange={(e) => handleChange('assignedEmployeeName', e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-900">Purchase & Warranty</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Purchase Date"
                value={formData.purchaseDate}
                onChange={(e) => handleChange('purchaseDate', e.target.value)}
                error={errors.purchaseDate}
                required
              />
              <Input
                type="date"
                label="Warranty Expiry"
                value={formData.warrantyExpiry}
                onChange={(e) => handleChange('warrantyExpiry', e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-900">Additional Details</h3>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes..."
            />
          </div>

          {isEditing && (
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-medium text-gray-900">Scrap Status</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isScrap"
                  checked={formData.isScrap}
                  onChange={(e) => handleChange('isScrap', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isScrap" className="ml-2 text-sm text-gray-900">
                  Mark as scrapped
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-6 border-t">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Equipment' : 'Create Equipment'}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={mutation.isPending}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
