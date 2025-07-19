
'use client';

import { useState, useEffect } from 'react';

import { MessageSquare, Phone, Mail, Calendar, Plus, Filter, Search, Building2, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OutreachActivity {
  id: string;
  type: string;
  prospectId: string;
  prospectName: string;
  businessName: string;
  subject: string;
  content: string;
  status: string;
  scheduledAt: string;
  completedAt: string;
  createdBy: string;
  createdAt: string;
}

export default function OutreachPage() {

  const [activities, setActivities] = useState<OutreachActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOutreachActivities();
  }, []);

  const fetchOutreachActivities = async () => {
    try {
      const response = await fetch('/api/outreach');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching outreach activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities?.filter(activity => {
    const matchesSearch = activity?.businessName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
                         activity?.subject?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
                         activity?.prospectName?.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesType = typeFilter === 'all' || activity?.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || activity?.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'email': return 'text-blue-600 bg-blue-100';
      case 'call': return 'text-green-600 bg-green-100';
      case 'meeting': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const todaysActivities = filteredActivities?.filter(activity => {
    const today = new Date().toDateString();
    const activityDate = new Date(activity?.scheduledAt || activity?.createdAt).toDateString();
    return activityDate === today;
  }) || [];

  const upcomingActivities = filteredActivities?.filter(activity => {
    const today = new Date();
    const activityDate = new Date(activity?.scheduledAt || activity?.createdAt);
    return activityDate > today && activity?.status === 'scheduled';
  }) || [];

  const completedActivities = filteredActivities?.filter(activity => 
    activity?.status === 'completed'
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-500">Loading outreach activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CCC Outreach Tracking</h1>
          <p className="text-gray-600">Manage loan officer outreach activities and follow-ups</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Outreach
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{todaysActivities?.length || 0}</p>
                <p className="text-sm text-gray-600">Today's Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{upcomingActivities?.length || 0}</p>
                <p className="text-sm text-gray-600">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{completedActivities?.length || 0}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{activities?.length || 0}</p>
                <p className="text-sm text-gray-600">Total Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities by prospect, business, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="call">Phone Call</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activities Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredActivities?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No outreach activities found</h3>
                <p className="text-gray-500 mb-4">
                  Start tracking your loan officer outreach activities and follow-ups.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule First Activity
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredActivities?.map((activity) => (
              <Card key={activity?.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`p-2 rounded-lg ${getTypeColor(activity?.type)}`}>
                          {getTypeIcon(activity?.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{activity?.subject}</h3>
                          <p className="text-gray-600">{activity?.businessName} - {activity?.prospectName}</p>
                        </div>
                        <Badge className={getStatusBadgeColor(activity?.status)}>
                          {activity?.status || 'Pending'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">By: {activity?.createdBy}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Scheduled: {new Date(activity?.scheduledAt || activity?.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {activity?.completedAt 
                              ? `Completed: ${new Date(activity.completedAt).toLocaleDateString()}`
                              : 'Not completed yet'
                            }
                          </span>
                        </div>
                      </div>
                      
                      {activity?.content && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">{activity.content}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {activity?.status === 'scheduled' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Mark Complete
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          {todaysActivities?.map((activity) => (
            <Card key={activity?.id} className="hover:shadow-md transition-shadow border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`p-2 rounded-lg ${getTypeColor(activity?.type)}`}>
                        {getTypeIcon(activity?.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{activity?.subject}</h3>
                        <p className="text-gray-600">{activity?.businessName} - {activity?.prospectName}</p>
                      </div>
                      <Badge className={getStatusBadgeColor(activity?.status)}>
                        {activity?.status || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) || (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities for today</h3>
                <p className="text-gray-500">All caught up! No outreach activities scheduled for today.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingActivities?.map((activity) => (
            <Card key={activity?.id} className="hover:shadow-md transition-shadow border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`p-2 rounded-lg ${getTypeColor(activity?.type)}`}>
                        {getTypeIcon(activity?.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{activity?.subject}</h3>
                        <p className="text-gray-600">{activity?.businessName} - {activity?.prospectName}</p>
                      </div>
                      <Badge className={getStatusBadgeColor(activity?.status)}>
                        {activity?.status || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) || (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming activities</h3>
                <p className="text-gray-500">Schedule follow-up activities to stay on top of your pipeline.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedActivities?.map((activity) => (
            <Card key={activity?.id} className="hover:shadow-md transition-shadow border-green-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`p-2 rounded-lg ${getTypeColor(activity?.type)}`}>
                        {getTypeIcon(activity?.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{activity?.subject}</h3>
                        <p className="text-gray-600">{activity?.businessName} - {activity?.prospectName}</p>
                      </div>
                      <Badge className={getStatusBadgeColor(activity?.status)}>
                        {activity?.status || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) || (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No completed activities</h3>
                <p className="text-gray-500">Completed outreach activities will appear here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
