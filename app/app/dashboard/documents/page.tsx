
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, Upload, Download, Eye, Trash2, Plus, Search, Filter, Building2, User, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  prospectId: string;
  prospectName: string;
  businessName: string;
  status: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  description: string;
}

const DOCUMENT_TYPES = [
  { value: 'financial_statement', label: 'Financial Statement' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'tax_return', label: 'Tax Return' },
  { value: 'business_license', label: 'Business License' },
  { value: 'insurance_certificate', label: 'Insurance Certificate' },
  { value: 'lease_agreement', label: 'Lease Agreement' },
  { value: 'equipment_invoice', label: 'Equipment Invoice' },
  { value: 'credit_report', label: 'Credit Report' },
  { value: 'application_form', label: 'Application Form' },
  { value: 'other', label: 'Other' }
];

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = doc?.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
                         doc?.businessName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
                         doc?.prospectName?.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesType = typeFilter === 'all' || doc?.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc?.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'financial_statement':
      case 'bank_statement':
      case 'tax_return':
        return '📊';
      case 'business_license':
      case 'insurance_certificate':
        return '📋';
      case 'lease_agreement':
        return '🏢';
      case 'equipment_invoice':
        return '🧾';
      case 'credit_report':
        return '📈';
      case 'application_form':
        return '📝';
      default:
        return '📄';
    }
  };

  const pendingDocuments = filteredDocuments?.filter(doc => doc?.status === 'pending') || [];
  const approvedDocuments = filteredDocuments?.filter(doc => doc?.status === 'approved') || [];
  const underReviewDocuments = filteredDocuments?.filter(doc => doc?.status === 'under_review') || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-500">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CCC Document Management</h1>
          <p className="text-gray-600">Secure loan application document collection and review</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{documents?.length || 0}</p>
                <p className="text-sm text-gray-600">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{pendingDocuments?.length || 0}</p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{underReviewDocuments?.length || 0}</p>
                <p className="text-sm text-gray-600">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{approvedDocuments?.length || 0}</p>
                <p className="text-sm text-gray-600">Approved</p>
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
                  placeholder="Search documents by name, business, or prospect..."
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
                {DOCUMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Document Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingDocuments?.length || 0})</TabsTrigger>
          <TabsTrigger value="review">Under Review ({underReviewDocuments?.length || 0})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedDocuments?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredDocuments?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-500 mb-4">
                  Start collecting loan application documents from your prospects.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload First Document
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredDocuments?.map((document) => (
                <Card key={document?.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="bg-blue-100 p-2 rounded-lg text-2xl">
                            {getFileIcon(document?.type)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{document?.name}</h3>
                            <p className="text-gray-600">{document?.businessName} - {document?.prospectName}</p>
                          </div>
                          <Badge className={getStatusBadgeColor(document?.status)}>
                            {document?.status?.replace('_', ' ') || 'Pending'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Document Type</p>
                              <p className="text-sm font-medium">
                                {DOCUMENT_TYPES.find(t => t.value === document?.type)?.label || 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Download className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">File Size</p>
                              <p className="text-sm font-medium">{formatFileSize(document?.size || 0)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Uploaded By</p>
                              <p className="text-sm font-medium">{document?.uploadedBy}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Upload Date</p>
                              <p className="text-sm font-medium">
                                {new Date(document?.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {document?.description && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">{document.description}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        {document?.status === 'pending' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingDocuments?.map((document) => (
            <Card key={document?.id} className="hover:shadow-md transition-shadow border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-yellow-100 p-2 rounded-lg text-2xl">
                      {getFileIcon(document?.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{document?.name}</h3>
                      <p className="text-gray-600">{document?.businessName} - {document?.prospectName}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded: {new Date(document?.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600">
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) || (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending documents</h3>
                <p className="text-gray-500">All documents have been reviewed.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          {underReviewDocuments?.map((document) => (
            <Card key={document?.id} className="hover:shadow-md transition-shadow border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg text-2xl">
                      {getFileIcon(document?.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{document?.name}</h3>
                      <p className="text-gray-600">{document?.businessName} - {document?.prospectName}</p>
                      <p className="text-sm text-gray-500">
                        Under review since: {new Date(document?.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Continue Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) || (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents under review</h3>
                <p className="text-gray-500">Documents currently being reviewed will appear here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedDocuments?.map((document) => (
            <Card key={document?.id} className="hover:shadow-md transition-shadow border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-2 rounded-lg text-2xl">
                      {getFileIcon(document?.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{document?.name}</h3>
                      <p className="text-gray-600">{document?.businessName} - {document?.prospectName}</p>
                      <p className="text-sm text-gray-500">
                        Approved: {new Date(document?.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) || (
            <Card>
              <CardContent className="p-8 text-center">
                <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No approved documents yet</h3>
                <p className="text-gray-500">Approved documents will appear here for download and processing.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
