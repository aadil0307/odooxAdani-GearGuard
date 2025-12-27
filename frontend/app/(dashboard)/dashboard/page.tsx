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
    <div className="space-y-8 animate-slide-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-3 text-blue-100 text-lg">{getWelcomeMessage()}</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm font-semibold text-white">Role: {userRole}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards - Placeholder for now */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:scale-105 transition-transform cursor-pointer border-none shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-transparent">
            <CardTitle className="text-sm font-bold text-slate-700">Total Requests</CardTitle>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <ClipboardList className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">--</div>
            <p className="text-xs text-slate-600 mt-1">Loading data...</p>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform cursor-pointer border-none shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-transparent">
            <CardTitle className="text-sm font-bold text-slate-700">In Progress</CardTitle>
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">--</div>
            <p className="text-xs text-slate-600 mt-1">Active tasks</p>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform cursor-pointer border-none shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-transparent">
            <CardTitle className="text-sm font-bold text-slate-700">Equipment</CardTitle>
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <Wrench className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">--</div>
            <p className="text-xs text-slate-600 mt-1">Total assets</p>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform cursor-pointer border-none shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-transparent">
            <CardTitle className="text-sm font-bold text-slate-700">Teams</CardTitle>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">--</div>
            <p className="text-xs text-slate-600 mt-1">Active teams</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
