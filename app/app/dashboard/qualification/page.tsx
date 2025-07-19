
'use client';

import { useState, useEffect } from 'react';

import { CheckSquare, Building2, DollarSign, Calendar, Users, MapPin, Phone, Mail, Star, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface QualificationCriteria {
  monthlyRevenue: number;
  businessAge: number;
  creditScore: number;
  businessType: string;
  location: string;
}

interface ProspectQualification {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
  monthlyRevenue: number;
  businessAge: number;
  creditScore: number;
  employeeCount: number;
  address: string;
  city: string;
  state: string;
  qualificationScore: number;
  status: string;
  criteria: {
    revenueCheck: boolean;
    ageCheck: boolean;
    creditCheck: boolean;
    typeCheck: boolean;
    locationCheck: boolean;
  };
  createdAt: string;
}

const QUALIFICATION_CRITERIA = {
  monthlyRevenue: 17000,
  businessAge: 6, // months
  creditScore: 600,
  businessTypes: ['DENTAL_PRACTICE', 'MEDICAL_PRACTICE', 'VETERINARY_CLINIC', 'PHYSICAL_THERAPY', 'URGENT_CARE', 'SPECIALTY_CLINIC'],
  locations: ['US'] // US-based only
};

export default function QualificationPage() {

  const [prospects, setProspects] = useState<ProspectQualification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProspectsForQualification();
  }, []);

  const fetchProspectsForQualification = async () => {
    try {
      const response = await fetch('/api/prospects');
      if (response.ok) {
        const data = await response.json();
        const prospectsWithQualification = (data.prospects || []).map(evaluateProspectQualification);
        setProspects(prospectsWithQualification);
      }
    } catch (error) {
      console.error('Error fetching prospects:', error);
    } finally {
      setLoading(false);
    }
  };

  const evaluateProspectQualification = (prospect: any): ProspectQualification => {
    const criteria = {
      revenueCheck: (prospect?.monthlyRevenue || 0) >= QUALIFICATION_CRITERIA.monthlyRevenue,
      ageCheck: calculateBusinessAge(prospect?.createdAt) >= QUALIFICATION_CRITERIA.businessAge,
      creditCheck: (prospect?.creditScore || 0) >= QUALIFICATION_CRITERIA.creditScore,
      typeCheck: QUALIFICATION_CRITERIA.businessTypes.includes(prospect?.businessType),
      locationCheck: prospect?.state && prospect?.state.length === 2 // US state format
    };

    const passedCriteria = Object.values(criteria).filter(Boolean).length;
    const qualificationScore = Math.round((passedCriteria / Object.keys(criteria).length) * 100);

    return {
      ...prospect,
      criteria,
      qualificationScore
    };
  };

  const calculateBusinessAge = (createdAt: string): number => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  };

  const getQualificationLevel = (score: number) => {
    if (score >= 80) return { level: 'Highly Qualified', color: 'bg-green-100 text-green-800', bgColor: 'bg-green-50' };
    if (score >= 60) return { level: 'Qualified', color: 'bg-yellow-100 text-yellow-800', bgColor: 'bg-yellow-50' };
    if (score >= 40) return { level: 'Partially Qualified', color: 'bg-orange-100 text-orange-800', bgColor: 'bg-orange-50' };
    return { level: 'Not Qualified', color: 'bg-red-100 text-red-800', bgColor: 'bg-red-50' };
  };

  const highlyQualified = prospects?.filter(p => p?.qualificationScore >= 80) || [];
  const qualified = prospects?.filter(p => p?.qualificationScore >= 60 && p?.qualificationScore < 80) || [];
  const needsReview = prospects?.filter(p => p?.qualificationScore < 60) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CheckSquare className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-500">Loading qualification data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CCC Lending Qualification</h1>
          <p className="text-gray-600">Evaluate prospects against CCC's lending criteria</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <CheckSquare className="h-4 w-4 mr-2" />
          Review Criteria
        </Button>
      </div>

      {/* Qualification Criteria Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-blue-600" />
            <span>CCC Lending Qualification Criteria</span>
          </CardTitle>
          <CardDescription>Healthcare businesses must meet these requirements for CCC lending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Monthly Revenue</span>
              </div>
              <p className="text-lg font-bold text-gray-900">${QUALIFICATION_CRITERIA.monthlyRevenue.toLocaleString()}+</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Business Age</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{QUALIFICATION_CRITERIA.businessAge}+ months</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Credit Score</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{QUALIFICATION_CRITERIA.creditScore}+</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Business Type</span>
              </div>
              <p className="text-lg font-bold text-gray-900">Healthcare</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Location</span>
              </div>
              <p className="text-lg font-bold text-gray-900">US-Based</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{highlyQualified?.length || 0}</p>
                <p className="text-sm text-gray-600">Highly Qualified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{qualified?.length || 0}</p>
                <p className="text-sm text-gray-600">Qualified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{needsReview?.length || 0}</p>
                <p className="text-sm text-gray-600">Needs Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{prospects?.length || 0}</p>
                <p className="text-sm text-gray-600">Total Prospects</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Qualification Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Prospects</TabsTrigger>
          <TabsTrigger value="highly-qualified">Highly Qualified ({highlyQualified?.length || 0})</TabsTrigger>
          <TabsTrigger value="qualified">Qualified ({qualified?.length || 0})</TabsTrigger>
          <TabsTrigger value="needs-review">Needs Review ({needsReview?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {prospects?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No prospects to qualify</h3>
                <p className="text-gray-500">Add prospects to start the qualification process.</p>
              </CardContent>
            </Card>
          ) : (
            prospects?.map((prospect) => {
              const qualification = getQualificationLevel(prospect?.qualificationScore || 0);
              return (
                <Card key={prospect?.id} className={`hover:shadow-md transition-shadow ${qualification.bgColor}`}>
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
                          <Badge className={qualification.color}>
                            {qualification.level}
                          </Badge>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Qualification Score</span>
                            <span className="text-sm font-bold text-gray-900">{prospect?.qualificationScore || 0}%</span>
                          </div>
                          <Progress value={prospect?.qualificationScore || 0} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className={`h-4 w-4 ${prospect?.criteria?.revenueCheck ? 'text-green-600' : 'text-red-600'}`} />
                            <div>
                              <p className="text-xs text-gray-500">Monthly Revenue</p>
                              <p className="text-sm font-medium">${prospect?.monthlyRevenue?.toLocaleString() || 0}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className={`h-4 w-4 ${prospect?.criteria?.ageCheck ? 'text-green-600' : 'text-red-600'}`} />
                            <div>
                              <p className="text-xs text-gray-500">Business Age</p>
                              <p className="text-sm font-medium">{calculateBusinessAge(prospect?.createdAt)} months</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className={`h-4 w-4 ${prospect?.criteria?.creditCheck ? 'text-green-600' : 'text-red-600'}`} />
                            <div>
                              <p className="text-xs text-gray-500">Credit Score</p>
                              <p className="text-sm font-medium">{prospect?.creditScore || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building2 className={`h-4 w-4 ${prospect?.criteria?.typeCheck ? 'text-green-600' : 'text-red-600'}`} />
                            <div>
                              <p className="text-xs text-gray-500">Business Type</p>
                              <p className="text-sm font-medium">{prospect?.businessType?.replace('_', ' ') || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className={`h-4 w-4 ${prospect?.criteria?.locationCheck ? 'text-green-600' : 'text-red-600'}`} />
                            <div>
                              <p className="text-xs text-gray-500">Location</p>
                              <p className="text-sm font-medium">{prospect?.city}, {prospect?.state}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{prospect?.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{prospect?.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{prospect?.employeeCount} employees</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        {prospect?.qualificationScore >= 60 ? (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Approve
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="highly-qualified" className="space-y-4">
          {highlyQualified?.map((prospect) => {
            const qualification = getQualificationLevel(prospect?.qualificationScore || 0);
            return (
              <Card key={prospect?.id} className="hover:shadow-md transition-shadow bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Building2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{prospect?.businessName}</h3>
                        <p className="text-gray-600">{prospect?.contactName}</p>
                        <Progress value={prospect?.qualificationScore || 0} className="h-2 w-32 mt-2" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800 mb-2">
                        {prospect?.qualificationScore}% Qualified
                      </Badge>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Fast Track
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }) || (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No highly qualified prospects yet</h3>
                <p className="text-gray-500">Prospects scoring 80%+ will appear here for fast-track processing.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="qualified" className="space-y-4">
          {qualified?.map((prospect) => (
            <Card key={prospect?.id} className="hover:shadow-md transition-shadow bg-yellow-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Building2 className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{prospect?.businessName}</h3>
                      <p className="text-gray-600">{prospect?.contactName}</p>
                      <Progress value={prospect?.qualificationScore || 0} className="h-2 w-32 mt-2" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-yellow-100 text-yellow-800 mb-2">
                      {prospect?.qualificationScore}% Qualified
                    </Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Process
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) || (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No qualified prospects yet</h3>
                <p className="text-gray-500">Prospects scoring 60-79% will appear here for standard processing.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="needs-review" className="space-y-4">
          {needsReview?.map((prospect) => (
            <Card key={prospect?.id} className="hover:shadow-md transition-shadow bg-red-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <Building2 className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{prospect?.businessName}</h3>
                      <p className="text-gray-600">{prospect?.contactName}</p>
                      <Progress value={prospect?.qualificationScore || 0} className="h-2 w-32 mt-2" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-red-100 text-red-800 mb-2">
                      {prospect?.qualificationScore}% Qualified
                    </Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) || (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No prospects need review</h3>
                <p className="text-gray-500">Prospects scoring below 60% will appear here for manual review.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
