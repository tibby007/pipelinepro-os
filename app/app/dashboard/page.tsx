
'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search,
  Database,
  MessageSquare,
  CheckSquare,
  FileText,
  Send,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Building2,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

// Mock data for dashboard metrics
const metrics = [
  {
    title: 'Total Prospects',
    value: '147',
    change: 12,
    trend: 'up' as const,
    icon: Building2,
  },
  {
    title: 'Qualified Prospects',
    value: '89',
    change: 8,
    trend: 'up' as const,
    icon: CheckSquare,
  },
  {
    title: 'Active Outreach',
    value: '23',
    change: -5,
    trend: 'down' as const,
    icon: MessageSquare,
  },
  {
    title: 'Submissions This Month',
    value: '12',
    change: 25,
    trend: 'up' as const,
    icon: Send,
  },
];

const quickActions = [
  {
    title: 'Research Prospects',
    description: 'Find new healthcare businesses to target',
    icon: Search,
    href: '/dashboard/research',
    color: 'bg-blue-500',
  },
  {
    title: 'Add Prospect',
    description: 'Manually add a new prospect to database',
    icon: Database,
    href: '/dashboard/prospects/new',
    color: 'bg-green-500',
  },
  {
    title: 'Send Outreach',
    description: 'Create and send email or LinkedIn message',
    icon: MessageSquare,
    href: '/dashboard/outreach/new',
    color: 'bg-purple-500',
  },
  {
    title: 'View Analytics',
    description: 'Check performance metrics and ROI',
    icon: BarChart3,
    href: '/dashboard/analytics',
    color: 'bg-orange-500',
  },
];

const recentActivity = [
  {
    type: 'prospect_added',
    message: 'New prospect "Downtown Dental" added',
    time: '2 hours ago',
    icon: Building2,
  },
  {
    type: 'email_sent',
    message: 'Email sent to "Medical Associates"',
    time: '4 hours ago',
    icon: MessageSquare,
  },
  {
    type: 'qualification_completed',
    message: 'Qualification completed for "City Vet Clinic"',
    time: '6 hours ago',
    icon: CheckSquare,
  },
  {
    type: 'submission_sent',
    message: 'Application submitted for "Wellness Center"',
    time: '1 day ago',
    icon: Send,
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-blue-100 mb-4">
          Manage your healthcare business prospects efficiently with our comprehensive pipeline system.
        </p>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Building2 className="h-4 w-4" />
            <span>Healthcare Focus</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>$17K+ Monthly Revenue</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>6+ Months in Business</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp
                  className={`mr-1 h-3 w-3 ${
                    metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}
                />
                <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to help you manage your prospect pipeline efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link key={action.title} href={action.href}>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {action.title}
                          </h4>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-gray-100 p-1.5 rounded-full">
                      <activity.icon className="h-3 w-3 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/dashboard/activity">View All Activity</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
