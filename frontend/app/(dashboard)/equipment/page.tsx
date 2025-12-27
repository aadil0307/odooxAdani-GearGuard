'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api-client';
import {
  Equipment,
  EquipmentCategory,
  Department,
  ApiResponse,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import {
  Plus,
  Search,
  Wrench,
  AlertTriangle,
  Filter,
  X,
} from 'lucide-react';
import { enumToDisplay, formatDate } from '@/lib/utils';

export default function EquipmentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [scrapFilter, setScrapFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch equipment
  const { data: response, isLoading, error } = useQuery<ApiResponse<{ equipment: Equipment[]; pagination: any }>>({
    queryKey: ['equipment', search, categoryFilter, departmentFilter, scrapFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      if (departmentFilter) params.append('department', departmentFilter);
      if (scrapFilter) params.append('isScrap', scrapFilter);
      
      return api.get(`/equipment?${params.toString()}`);
    },
  });

  const equipment = (response?.success && response?.data?.equipment) ? response.data.equipment : [];

  // Category options
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...Object.values(EquipmentCategory).map(cat => ({
      value: cat,
      label: enumToDisplay(cat),
    })),
  ];

  // Department options
  const departmentOptions = [
    { value: '', label: 'All Departments' },
    ...Object.values(Department).map(dept => ({
      value: dept,
      label: enumToDisplay(dept),
    })),
  ];

  // Scrap options
  const scrapOptions = [
    { value: '', label: 'All Status' },
    { value: 'false', label: 'Active Only' },
    { value: 'true', label: 'Scrapped Only' },
  ];

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setDepartmentFilter('');
    setScrapFilter('');
  };

  const activeFiltersCount = [search, categoryFilter, departmentFilter, scrapFilter].filter(Boolean).length;

  if (isLoading) {
    return <Loading text="Loading equipment..." />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load equipment" type="error" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
          <p className="mt-1 text-gray-600">
            Manage company assets and track maintenance history
          </p>
        </div>
        <Button onClick={() => router.push('/equipment/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Equipment
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or serial number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="info" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <Select
                  label="Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  options={categoryOptions}
                />
                <Select
                  label="Department"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  options={departmentOptions}
                />
                <Select
                  label="Status"
                  value={scrapFilter}
                  onChange={(e) => setScrapFilter(e.target.value)}
                  options={scrapOptions}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Equipment Count */}
      <div className="text-sm text-gray-600">
        Showing {equipment.length} equipment{equipment.length !== 1 ? 's' : ''}
      </div>

      {/* Equipment Grid */}
      {equipment.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wrench className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No equipment found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {activeFiltersCount > 0
                ? 'Try adjusting your filters'
                : 'Get started by adding your first equipment'}
            </p>
            {activeFiltersCount === 0 && (
              <Button className="mt-4" onClick={() => router.push('/equipment/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Equipment
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((item) => (
            <Card
              key={item.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                item.isScrap ? 'border-red-300 bg-red-50' : ''
              }`}
              onClick={() => router.push(`/equipment/${item.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.serialNumber}
                    </p>
                  </div>
                  {item.isScrap && (
                    <Badge variant="danger">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Scrapped
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Category</span>
                  <Badge variant="default">
                    {enumToDisplay(item.category)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Department</span>
                  <span className="font-medium text-gray-900">
                    {enumToDisplay(item.department)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-gray-900">
                    {item.physicalLocation}
                  </span>
                </div>
                {item.assignedEmployeeName && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Assigned To</span>
                    <span className="font-medium text-gray-900">
                      {item.assignedEmployeeName}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span className="text-gray-500">Purchased</span>
                  <span className="text-gray-900">
                    {formatDate(item.purchaseDate)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
