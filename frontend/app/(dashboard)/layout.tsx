'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Wrench, 
  Users, 
  ClipboardList, 
  BarChart3, 
  LogOut, 
  Menu,
  X 
} from 'lucide-react';
import { UserRole } from '@/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles: UserRole[];
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN, UserRole.USER],
  },
  {
    name: 'Equipment',
    href: '/equipment',
    icon: Wrench,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN],
  },
  {
    name: 'Teams',
    href: '/teams',
    icon: Users,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    name: 'Requests',
    href: '/requests',
    icon: ClipboardList,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN, UserRole.USER],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading..." />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const user = session?.user;
  const userRole = user?.role as UserRole;

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(userRole)
  );

  const handleSignOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    await signOut({ callbackUrl: '/login' });
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'danger';
      case UserRole.MANAGER:
        return 'warning';
      case UserRole.TECHNICIAN:
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-blue-600 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 py-6">
            <div className="p-2 bg-white rounded-lg">
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
            <span className="ml-3 text-white text-xl font-bold">GearGuard</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="flex-shrink-0 flex border-t border-blue-700 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-blue-200 truncate">{user?.email}</p>
                  <Badge
                    variant={getRoleBadgeVariant(userRole)}
                    className="mt-1"
                  >
                    {userRole}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full mt-2 text-blue-100 hover:text-white hover:bg-blue-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-blue-600 z-50 md:hidden">
            <div className="flex items-center justify-between px-4 py-6">
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-lg">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
                <span className="ml-3 text-white text-xl font-bold">GearGuard</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 px-2 space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex-shrink-0 border-t border-blue-700 p-4">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-blue-200">{user?.email}</p>
              <Badge variant={getRoleBadgeVariant(userRole)} className="mt-1">
                {userRole}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full mt-2 text-blue-100 hover:text-white hover:bg-blue-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 md:hidden flex-shrink-0 flex h-16 bg-white shadow">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">GearGuard</h1>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
