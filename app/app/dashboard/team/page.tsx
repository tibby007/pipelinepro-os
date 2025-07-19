
'use client';

import { useState, useEffect } from 'react';

import { Users, Plus, Search, Filter, Mail, Phone, Shield, Calendar, Award, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  joinedAt: string;
  lastActive: string;
  avatar: string;
  phone: string;
  performance: {
    prospectsGenerated: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  };
}

export default function TeamPage() {

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team');
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.teamMembers || []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockTeamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@ccc.com',
      role: 'ADMIN',
      department: 'Leadership',
      status: 'active',
      joinedAt: '2023-01-15',
      lastActive: '2025-01-19',
      avatar: '',
      phone: '+1 (555) 123-4567',
      performance: {
        prospectsGenerated: 34,
        conversions: 22,
        revenue: 3080000,
        conversionRate: 64.7
      }
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      email: 'mike.rodriguez@ccc.com',
      role: 'LOAN_OFFICER',
      department: 'Lending',
      status: 'active',
      joinedAt: '2023-03-22',
      lastActive: '2025-01-19',
      avatar: '',
      phone: '+1 (555) 234-5678',
      performance: {
        prospectsGenerated: 28,
        conversions: 18,
        revenue: 2520000,
        conversionRate: 64.3
      }
    },
    {
      id: '3',
      name: 'Lisa Chen',
      email: 'lisa.chen@ccc.com',
      role: 'LOAN_OFFICER',
      department: 'Lending',
      status: 'active',
      joinedAt: '2023-05-10',
      lastActive: '2025-01-18',
      avatar: '',
      phone: '+1 (555) 345-6789',
      performance: {
        prospectsGenerated: 31,
        conversions: 16,
        revenue: 2240000,
        conversionRate: 51.6
      }
    },
    {
      id: '4',
      name: 'David Smith',
      email: 'david.smith@ccc.com',
      role: 'BUSINESS_DEVELOPMENT',
      department: 'Sales',
      status: 'active',
      joinedAt: '2023-07-18',
      lastActive: '2025-01-19',
      avatar: '',
      phone: '+1 (555) 456-7890',
      performance: {
        prospectsGenerated: 25,
        conversions: 15,
        revenue: 2100000,
        conversionRate: 60.0
      }
    },
    {
      id: '5',
      name: 'Jennifer Wilson',
      email: 'jennifer.wilson@ccc.com',
      role: 'UNDERWRITER',
      department: 'Risk Management',
      status: 'active',
      joinedAt: '2023-09-05',
      lastActive: '2025-01-19',
      avatar: '',
      phone: '+1 (555) 567-8901',
      performance: {
        prospectsGenerated: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0
      }
    },
    {
      id: '6',
      name: 'Robert Kim',
      email: 'robert.kim@ccc.com',
      role: 'ANALYST',
      department: 'Analytics',
      status: 'inactive',
      joinedAt: '2023-11-12',
      lastActive: '2025-01-15',
      avatar: '',
      phone: '+1 (555) 678-9012',
      performance: {
        prospectsGenerated: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0
      }
    }
  ];

  const displayTeamMembers = teamMembers.length > 0 ? teamMembers : mockTeamMembers;

  const filteredTeamMembers = displayTeamMembers?.filter(member => {
    const matchesSearch = member?.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
                         member?.email?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
                         member?.department?.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesRole = roleFilter === 'all' || member?.role === roleFilter;
    const matchesDepartment = departmentFilter === 'all' || member?.department === departmentFilter;
    
    return matchesSearch && matchesRole && matchesDepartment;
  }) || [];

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'LOAN_OFFICER': return 'bg-blue-100 text-blue-800';
      case 'BUSINESS_DEVELOPMENT': return 'bg-green-100 text-green-800';
      case 'UNDERWRITER': return 'bg-orange-100 text-orange-800';
      case 'ANALYST': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return <Shield className="h-4 w-4" />;
      case 'LOAN_OFFICER': return <Users className="h-4 w-4" />;
      case 'BUSINESS_DEVELOPMENT': return <BarChart3 className="h-4 w-4" />;
      case 'UNDERWRITER': return <Award className="h-4 w-4" />;
      case 'ANALYST': return <BarChart3 className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getInitials = (name: string): string => {
    return name
      ?.split(' ')
      ?.map(word => word[0])
      ?.join('')
      ?.toUpperCase()
      ?.slice(0, 2) || 'NA';
  };

  const activeMembers = filteredTeamMembers?.filter(m => m?.status === 'active')?.length || 0;
  const totalRevenue = filteredTeamMembers?.reduce((sum, m) => sum + (m?.performance?.revenue || 0), 0) || 0;
  const avgConversionRate = filteredTeamMembers?.length > 0 
    ? filteredTeamMembers?.reduce((sum, m) => sum + (m?.performance?.conversionRate || 0), 0) / filteredTeamMembers.length 
    : 0;

  if (loading && teamMembers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-500">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CCC Team Management</h1>
          <p className="text-gray-600">Manage loan officers and business development team members</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{filteredTeamMembers?.length || 0}</p>
                <p className="text-sm text-gray-600">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeMembers}</p>
                <p className="text-sm text-gray-600">Active Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Avg Conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">${(totalRevenue / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-gray-600">Team Revenue</p>
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
                  placeholder="Search team members by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="LOAN_OFFICER">Loan Officer</SelectItem>
                <SelectItem value="BUSINESS_DEVELOPMENT">Business Development</SelectItem>
                <SelectItem value="UNDERWRITER">Underwriter</SelectItem>
                <SelectItem value="ANALYST">Analyst</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
                <SelectItem value="Lending">Lending</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Risk Management">Risk Management</SelectItem>
                <SelectItem value="Analytics">Analytics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <div className="grid gap-4">
        {filteredTeamMembers?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || roleFilter !== 'all' || departmentFilter !== 'all' 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Start building your team by adding loan officers and business development members.'}
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add First Team Member
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTeamMembers?.map((member) => (
            <Card key={member?.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member?.avatar} alt={member?.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {getInitials(member?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{member?.name}</h3>
                        <p className="text-gray-600">{member?.department}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getRoleBadgeColor(member?.role)}>
                          <div className="flex items-center space-x-1">
                            {getRoleIcon(member?.role)}
                            <span>{member?.role?.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                        <Badge className={getStatusBadgeColor(member?.status)}>
                          {member?.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{member?.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{member?.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Joined: {new Date(member?.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Last Active: {new Date(member?.lastActive).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {member?.performance?.conversionRate?.toFixed(1)}% conversion
                        </span>
                      </div>
                    </div>
                    
                    {member?.performance?.prospectsGenerated > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Prospects Generated</p>
                            <p className="font-bold text-blue-600">{member.performance.prospectsGenerated}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Conversions</p>
                            <p className="font-bold text-green-600">{member.performance.conversions}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Revenue Generated</p>
                            <p className="font-bold text-purple-600">
                              ${(member.performance.revenue / 1000000).toFixed(1)}M
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Conversion Rate</p>
                            <p className="font-bold text-orange-600">{member.performance.conversionRate.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit Profile
                    </Button>
                    {member?.status === 'active' ? (
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        Deactivate
                      </Button>
                    ) : (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Activate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
