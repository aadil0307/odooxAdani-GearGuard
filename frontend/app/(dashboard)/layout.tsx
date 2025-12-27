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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar - Desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 py-8 border-b border-slate-700/50">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Wrench className="h-7 w-7 text-white" />
            </div>
            <div className="ml-4">
              <span className="text-white text-2xl font-bold tracking-tight">GearGuard</span>
              <p className="text-slate-400 text-xs mt-0.5">Maintenance Tracker</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:scale-105'
                  )}
                >
                  <Icon className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-transform",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="flex-shrink-0 border-t border-slate-700/50 p-4 bg-slate-800/50">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <Badge
                variant={getRoleBadgeVariant(userRole)}
                className="mb-3 w-full justify-center py-1.5 font-medium"
              >
                {userRole}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full text-slate-300 hover:text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex flex-col w-72 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl z-50 md:hidden">
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-700/50">
              <div className="flex items-center">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <span className="text-white text-xl font-bold">GearGuard</span>
                  <p className="text-slate-400 text-xs">Maintenance</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex-shrink-0 border-t border-slate-700/50 p-4 bg-slate-800/50">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <Badge variant={getRoleBadgeVariant(userRole)} className="mb-3 w-full justify-center py-1.5">
                {userRole}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full text-slate-300 hover:text-white hover:bg-slate-700/50 border border-slate-700/50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="md:pl-72 flex flex-col flex-1">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 md:hidden flex-shrink-0 flex h-16 bg-white/80 backdrop-blur-lg shadow-sm border-b border-slate-200">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-4 text-slate-600 hover:text-slate-900 focus:outline-none transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-2">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">GearGuard</h1>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 pb-8">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
