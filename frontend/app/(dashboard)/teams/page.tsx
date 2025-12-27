'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api-client';
import { MaintenanceTeam, ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { Plus, Search, Users } from 'lucide-react';

export default function TeamsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: response, isLoading, error } = useQuery<ApiResponse<MaintenanceTeam[]>>({
    queryKey: ['teams'],
    queryFn: () => api.get('/teams'),
  });

  const teams = (response?.success && Array.isArray(response?.data)) ? response.data : [];

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <Loading text="Loading teams..." />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load teams" type="error" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Teams</h1>
          <p className="mt-1 text-gray-600">
            Manage maintenance teams and their members
          </p>
        </div>
        <Button onClick={() => router.push('/teams/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Team
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No teams found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {search ? 'Try a different search term' : 'Create your first maintenance team'}
            </p>
            {!search && (
              <Button className="mt-4" onClick={() => router.push('/teams/new')}>
                <Plus className="mr-2 h-4 w-4" />
                New Team
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card
              key={team.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/teams/${team.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                  </div>
                  <Badge variant="default">{team.members.length} members</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-2">Team Members:</div>
                  {team.members.length === 0 ? (
                    <p className="text-gray-400 italic">No members assigned</p>
                  ) : (
                    <ul className="space-y-1">
                      {team.members.slice(0, 3).map((member) => (
                        <li key={member.id} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>{member.name}</span>
                          <Badge variant="info" className="text-xs">
                            {member.role}
                          </Badge>
                        </li>
                      ))}
                      {team.members.length > 3 && (
                        <li className="text-gray-400 italic">
                          +{team.members.length - 3} more
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
