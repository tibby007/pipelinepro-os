
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Search,
  Database,
  MessageSquare,
  CheckSquare,
  FileText,
  Send,
  BarChart3,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';

const navigation = [
  {
    name: 'Research',
    href: '/dashboard/research',
    icon: Search,
    description: 'Find and qualify healthcare prospects',
  },
  {
    name: 'Prospects',
    href: '/dashboard/prospects',
    icon: Database,
    description: 'Manage prospect database',
  },
  {
    name: 'Outreach',
    href: '/dashboard/outreach',
    icon: MessageSquare,
    description: 'Multi-channel communication',
  },
  {
    name: 'Qualification',
    href: '/dashboard/qualification',
    icon: CheckSquare,
    description: 'Qualify and score prospects',
  },
  {
    name: 'Documents',
    href: '/dashboard/documents',
    icon: FileText,
    description: 'Collect and manage documents',
  },
  {
    name: 'Submissions',
    href: '/dashboard/submissions',
    icon: Send,
    description: 'Submit applications',
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Performance metrics and ROI',
  },
];

const adminNavigation = [
  {
    name: 'Team',
    href: '/dashboard/team',
    icon: Users,
    description: 'Manage team members',
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'System configuration',
  },
];

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = userRole === 'ADMIN';
  const allNavigation = isAdmin ? [...navigation, ...adminNavigation] : navigation;

  return (
    <div
      className={cn(
        'bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">CCC Pipeline</h1>
                <p className="text-xs text-gray-500">Healthcare Prospects</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {allNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
                title={collapsed ? item.name : ''}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  )}
                />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {item.description}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-blue-900">
                Healthcare Focus
              </div>
              <div className="text-xs text-blue-700 mt-1">
                Targeting $17K+ monthly revenue businesses with 6+ months operation
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
