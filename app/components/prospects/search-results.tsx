
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  MapPin,
  Phone,
  Globe,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Business {
  id: string;
  name: string;
  address: string;
  phone?: string;
  businessType: string;
  industryCategory: string;
  estimatedRevenue: string;
  yearsInBusiness: string;
  employeeCount: string;
  website?: string;
  qualificationIndicators: {
    revenueQualified: boolean;
    experienceQualified: boolean;
    locationQualified: boolean;
    industryQualified: boolean;
  };
  qualificationScore: number;
  isQualified: boolean;
}

interface SearchResultsProps {
  businesses: Business[];
  searchCriteria?: {
    location: string;
    industryTypes: string[];
    industryCategory?: string;
    radius: number;
  };
  onAddProspect: (business: Business) => void;
  dataSource?: string;
  message?: string;
}

export function SearchResults({ businesses, searchCriteria, onAddProspect, dataSource, message }: SearchResultsProps) {
  const [addingProspects, setAddingProspects] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleAddProspect = async (business: Business) => {
    setAddingProspects(prev => new Set(prev).add(business.id));
    
    try {
      await onAddProspect(business);
      toast({
        title: 'Success',
        description: `${business.name} has been added to your prospects`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add prospect. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAddingProspects(prev => {
        const newSet = new Set(prev);
        newSet.delete(business.id);
        return newSet;
      });
    }
  };

  const getQualificationColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (businesses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or expanding the search radius.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Summary */}
      {searchCriteria && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Found <span className="font-semibold">{businesses.length}</span> businesses
                in <span className="font-semibold">{searchCriteria.location}</span>
                {searchCriteria.industryCategory && (
                  <> in <span className="font-semibold">{searchCriteria.industryCategory.replace('_', ' ').toLowerCase()}</span> industry</>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-gray-500">
                  Search radius: {searchCriteria.radius} miles
                </div>
                {dataSource && (
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${dataSource === 'live' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className={`font-medium ${dataSource === 'live' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {dataSource === 'live' ? 'Live Data' : 'Sample Data'}
                    </span>
                  </div>
                )}
                {message && (
                  <div className="text-xs text-gray-500 ml-2" title={message}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="grid gap-6">
        {businesses.map((business) => (
          <Card key={business.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span>{business.name}</span>
                    <Badge variant="outline">{business.businessType}</Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{business.address}</span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge className={getQualificationColor(business.qualificationScore)}>
                    {business.qualificationScore}% Match
                  </Badge>
                  {business.isQualified && (
                    <div className="flex items-center space-x-1 text-green-600 text-sm mt-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Qualified</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Revenue */}
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Estimated Revenue</p>
                    <p className="text-sm font-medium">{business.estimatedRevenue}</p>
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Years in Business</p>
                    <p className="text-sm font-medium">{business.yearsInBusiness}</p>
                  </div>
                </div>

                {/* Employees */}
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Employee Count</p>
                    <p className="text-sm font-medium">{business.employeeCount}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{business.phone || 'Not available'}</p>
                  </div>
                </div>
              </div>

              {/* Qualification Indicators */}
              <div className="border rounded-lg p-4 bg-gray-50 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Qualification Indicators</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    {business.qualificationIndicators.revenueQualified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">Revenue Qualified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {business.qualificationIndicators.experienceQualified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">Experience Qualified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {business.qualificationIndicators.locationQualified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">US-Based Business</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {business.qualificationIndicators.industryQualified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">Industry Match</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {business.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={business.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-3 w-3 mr-1" />
                        Website
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
                <Button
                  onClick={() => handleAddProspect(business)}
                  disabled={addingProspects.has(business.id)}
                  className="min-w-[120px]"
                >
                  {addingProspects.has(business.id) ? (
                    'Adding...'
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Prospect
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
