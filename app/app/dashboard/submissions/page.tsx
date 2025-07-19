
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Building2, User, Calendar, CheckCircle, Clock, AlertCircle, DollarSign, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface Submission {
  id: string;
  prospectId: string;
  prospectName: string;
  businessName: string;
  lendingPartner: string;
  requestedAmount: number;
  status: string;
  submittedAt: string;
  submittedBy: string;
  lastUpdate: string;
  expectedDecision: string;
  notes: string;
  documents: number;
  qualificationScore: number;
}

const LENDING_PARTNERS = [
  { value: 'partner_a', label: 'Healthcare Finance Partners' },
  { value: 'partner_b', label: 'Medical Equipment Lending' },
  { value: 'partner_c', label: 'Practice Growth Capital' },
  { value: 'partner_d', label: 'Dental Investment Group' },
  { value: 'partner_e', label: 'Veterinary Capital Solutions' }
];

export default function SubmissionsPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions?.filter(submission => {
    const matchesSearch = submission?.businessName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
                         submission?.prospectName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
                         submission?.lendingPartner?.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesPartner = partnerFilter === 'all' || submission?.lendingPartner === partnerFilter;
    const matchesStatus = statusFilter === 'all' || submission?.status === statusFilter;
    
    return matchesSearch && matchesPartner && matchesStatus;
  }) || [];

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending_info': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'submitted': return <Send className="h-4 w-4" />;
      case 'under_review': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      case 'pending_info': return <AlertCircle className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  const getDaysInProgress = (submittedAt: string): number => {
    const submitted = new Date(submittedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - submitted.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const submittedCount = filteredSubmissions?.filter(s => s?.status === 'submitted')?.length || 0;
  const underReviewCount = filteredSubmissions?.filter(s => s?.status === 'under_review')?.length || 0;
  const approvedCount = filteredSubmissions?.filter(s => s?.status === 'approved')?.length || 0;
  const rejectedCount = filteredSubmissions?.filter(s => s?.status === 'rejected')?.length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Send className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-500">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CCC Lending Submissions</h1>
          <p className="text-gray-600">Submit applications to CCC's lending partners</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Submission
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{submittedCount}</p>
                <p className="text-sm text-gray-600">Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{underReviewCount}</p>
                <p className="text-sm text-gray-600">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  ${filteredSubmissions?.reduce((sum, s) => sum + (s?.requestedAmount || 0), 0)?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-gray-600">Total Requested</p>
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
                  placeholder="Search submissions by business, prospect, or partner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={partnerFilter} onValueChange={setPartnerFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by partner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Partners</SelectItem>
                {LENDING_PARTNERS.map(partner => (
                  <SelectItem key={partner.value} value={partner.value}>{partner.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="pending_info">Pending Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Submissions</TabsTrigger>
          <TabsTrigger value="active">Active ({submittedCount + underReviewCount})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredSubmissions?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                <p className="text-gray-500 mb-4">
                  Start submitting qualified prospects to lending partners.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Submission
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions?.map((submission) => (
              <Card key={submission?.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          {getStatusIcon(submission?.status)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{submission?.businessName}</h3>
                          <p className="text-gray-600">{submission?.prospectName}</p>
                        </div>
                        <Badge className={getStatusBadgeColor(submission?.status)}>
                          {submission?.status?.replace('_', ' ') || 'Submitted'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Lending Partner</p>
                            <p className="text-sm font-medium">
                              {LENDING_PARTNERS.find(p => p.value === submission?.lendingPartner)?.label || submission?.lendingPartner}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Requested Amount</p>
                            <p className="text-sm font-medium">${submission?.requestedAmount?.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Submitted</p>
                            <p className="text-sm font-medium">
                              {new Date(submission?.submittedAt).toLocaleDateString()} ({getDaysInProgress(submission?.submittedAt)} days ago)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Submitted By</p>
                            <p className="text-sm font-medium">{submission?.submittedBy}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Qualification Score:</span>
                          <span className="text-sm font-medium text-blue-600">{submission?.qualificationScore}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Documents:</span>
                          <span className="text-sm font-medium text-gray-900">{submission?.documents} files</span>
                        </div>
                        {submission?.expectedDecision && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Expected Decision:</span>
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(submission.expectedDecision).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {submission?.notes && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">{submission.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {submission?.status === 'pending_info' && (
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                          Update Info
                        </Button>
                      )}
                      {(submission?.status === 'submitted' || submission?.status === 'under_review') && (
                        <Button size="sm" variant="outline">
                          Check Status
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {filteredSubmissions?.filter(s => s?.status === 'submitted' || s?.status === 'under_review')?.map((submission) => (
            <Card key={submission?.id} className="hover:shadow-md transition-shadow border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      {getStatusIcon(submission?.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{submission?.businessName}</h3>
                      <p className="text-gray-600">{submission?.prospectName}</p>
                      <p className="text-sm text-gray-500">
                        {LENDING_PARTNERS.find(p => p.value === submission?.lendingPartner)?.label} - 
                        ${submission?.requestedAmount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusBadgeColor(submission?.status)}>
                      {submission?.status?.replace('_', ' ')}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-2">
                      Day {getDaysInProgress(submission?.submittedAt)} in process
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) || (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active submissions</h3>
                <p className="text-gray-500">Active submissions will appear here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filteredSubmissions?.filter(s => s?.status === 'approved')?.map((submission) => (
            <Card key={submission?.id} className="hover:shadow-md transition-shadow border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{submission?.businessName}</h3>
                      <p className="text-gray-600">{submission?.prospectName}</p>
                      <p className="text-sm text-gray-500">
                        {LENDING_PARTNERS.find(p => p.value === submission?.lendingPartner)?.label} - 
                        ${submission?.requestedAmount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">
                      Approved
                    </Badge>
                    <p className="text-sm text-gray-500 mt-2">
                      Approved on {new Date(submission?.lastUpdate || submission?.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) || (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No approved submissions yet</h3>
                <p className="text-gray-500">Approved loan applications will appear here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {filteredSubmissions?.filter(s => s?.status === 'rejected')?.map((submission) => (
            <Card key={submission?.id} className="hover:shadow-md transition-shadow border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{submission?.businessName}</h3>
                      <p className="text-gray-600">{submission?.prospectName}</p>
                      <p className="text-sm text-gray-500">
                        {LENDING_PARTNERS.find(p => p.value === submission?.lendingPartner)?.label} - 
                        ${submission?.requestedAmount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-red-100 text-red-800">
                      Rejected
                    </Badge>
                    <p className="text-sm text-gray-500 mt-2">
                      Rejected on {new Date(submission?.lastUpdate || submission?.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) || (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rejected submissions</h3>
                <p className="text-gray-500">Rejected applications will appear here for review and resubmission.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
