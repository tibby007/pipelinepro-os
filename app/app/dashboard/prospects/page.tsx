
'use client';

import { useState, useEffect } from 'react';

import { Database, Search, Filter, Plus, Phone, Mail, Building2, DollarSign, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Prospect {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  monthlyRevenue: number;
  employeeCount: number;
  status: string;
  qualificationScore: number;
  createdAt: string;
  lastContact: string;
}

export default function ProspectsPage() {

  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      const response = await fetch('/api/prospects');
      if (response.ok) {
        const data = await response.json();
        setProspects(data.prospects || []);
      }
    } catch (error) {
      console.error('Error fetching prospects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProspects = prospects?.filter(prospect => {
    const matchesSearch = prospect?.businessName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
                         prospect?.contactName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
                         prospect?.city?.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prospect?.status === statusFilter;
    const matchesBusinessType = businessTypeFilter === 'all' || prospect?.businessType === businessTypeFilter;
    
    return matchesSearch && matchesStatus && matchesBusinessType;
  }) || [];

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'unqualified': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualificationColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Database className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-500">Loading prospects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CCC Prospect Database</h1>
          <p className="text-gray-600">Manage and track healthcare lending prospects</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Prospect
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{prospects?.length || 0}</p>
                <p className="text-sm text-gray-600">Total Prospects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{prospects?.filter(p => p?.status === 'qualified')?.length || 0}</p>
                <p className="text-sm text-gray-600">Qualified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{prospects?.filter(p => p?.status === 'contacted')?.length || 0}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{prospects?.filter(p => p?.status === 'converted')?.length || 0}</p>
                <p className="text-sm text-gray-600">Converted</p>
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
                  placeholder="Search prospects by name, business, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="unqualified">Unqualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="DENTAL_PRACTICE">Dental Practice</SelectItem>
                <SelectItem value="MEDICAL_PRACTICE">Medical Practice</SelectItem>
                <SelectItem value="VETERINARY_CLINIC">Veterinary Clinic</SelectItem>
                <SelectItem value="PHYSICAL_THERAPY">Physical Therapy</SelectItem>
                <SelectItem value="URGENT_CARE">Urgent Care</SelectItem>
                <SelectItem value="SPECIALTY_CLINIC">Specialty Clinic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prospects List */}
      <div className="grid gap-4">
        {filteredProspects?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prospects found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || businessTypeFilter !== 'all' 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Start building your prospect database by adding new healthcare businesses.'}
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add First Prospect
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredProspects?.map((prospect) => (
            <Card key={prospect?.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{prospect?.businessName}</h3>
                        <p className="text-gray-600">{prospect?.contactName}</p>
                      </div>
                      <Badge className={getStatusBadgeColor(prospect?.status)}>
                        {prospect?.status || 'New'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{prospect?.city}, {prospect?.state}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{prospect?.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          ${prospect?.monthlyRevenue?.toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {prospect?.lastContact ? new Date(prospect.lastContact).toLocaleDateString() : 'No contact'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Qualification Score:</span>
                        <span className={`text-sm font-medium ${getQualificationColor(prospect?.qualificationScore || 0)}`}>
                          {prospect?.qualificationScore || 0}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {prospect?.businessType?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
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
