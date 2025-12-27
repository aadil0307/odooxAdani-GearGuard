'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Wrench, 
  Users, 
  ClipboardList, 
  BarChart3, 
  Plus,
  AlertCircle 
} from 'lucide-react';
import { UserRole } from '@/types';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const userRole = user?.role as UserRole;

  const getWelcomeMessage = () => {
    switch (userRole) {
      case UserRole.ADMIN:
        return 'You have full system access to manage all resources.';
      case UserRole.MANAGER:
        return 'Manage teams, equipment, and maintenance requests.';
      case UserRole.TECHNICIAN:
        return 'View and work on assigned maintenance requests.';
      case UserRole.USER:
        return 'Create and track your maintenance requests.';
      default:
        return 'Welcome to GearGuard!';
    }
  };

  const quickActions = [
    {
      title: 'View Equipment',
      description: 'Browse and manage company equipment',
      href: '/equipment',
      icon: Wrench,
      color: 'bg-blue-100 text-blue-600',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN],
    },
    {
      title: 'Manage Teams',
      description: 'View and organize maintenance teams',
      href: '/teams',
      icon: Users,
      color: 'bg-green-100 text-green-600',
      roles: [UserRole.ADMIN, UserRole.MANAGER],
    },
    {
      title: 'Create Request',
      description: 'Submit a new maintenance request',
      href: '/requests?action=create',
      icon: Plus,
      color: 'bg-purple-100 text-purple-600',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
    },
    {
      title: 'View Requests',
      description: 'Browse all maintenance requests',
      href: '/requests',
      icon: ClipboardList,
      color: 'bg-yellow-100 text-yellow-600',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN, UserRole.USER],
    },
    {
      title: 'View Reports',
      description: 'Analytics and insights',
      href: '/reports',
      icon: BarChart3,
      color: 'bg-red-100 text-red-600',
      roles: [UserRole.ADMIN, UserRole.MANAGER],
    },
  ];

  const filteredActions = quickActions.filter((action) =>
    action.roles.includes(userRole)
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">{getWelcomeMessage()}</p>
        <Badge variant="info" className="mt-2">
          Role: {userRole}
        </Badge>
      </div>

      {/* Stats Cards - Placeholder for now */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <ClipboardList className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-gray-500">Loading...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-gray-500">Loading...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipment</CardTitle>
            <Wrench className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-gray-500">Loading...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className={`inline-flex p-3 rounded-lg ${action.color} mb-3`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Getting Started</CardTitle>
          <CardDescription className="text-blue-700">
            GearGuard helps you manage equipment maintenance efficiently
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p><strong>Equipment:</strong> View and manage all company assets with maintenance history</p>
          <p><strong>Requests:</strong> Create and track maintenance work with defined workflows (New → In Progress → Repaired)</p>
          <p><strong>Teams:</strong> Organize technicians into specialized maintenance groups</p>
          <p><strong>Reports:</strong> Get insights into maintenance performance and equipment health</p>
        </CardContent>
      </Card>
    </div>
  );
}
