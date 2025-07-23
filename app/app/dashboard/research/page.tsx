
'use client';

import { useState } from 'react';
import { SearchForm, SearchCriteria } from '@/components/prospects/search-form';
import { SearchResults } from '@/components/prospects/search-results';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Building2,
  TrendingUp,
  Users,
  MapPin,
  RefreshCw,
} from 'lucide-react';

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

interface SearchResult {
  businesses: Business[];
  searchCriteria: SearchCriteria;
  totalResults: number;
  source?: string; // Legacy field for compatibility
  dataSource?: string; // 'live' or 'mock'
  message?: string;
}

export default function ResearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchCriteria[]>([]);
  const { toast } = useToast();

  const handleSearch = async (criteria: SearchCriteria) => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        location: criteria.location,
        radius: criteria.radius.toString(),
      });

      // Add industry types as comma-separated string
      if (criteria.industryTypes && criteria.industryTypes.length > 0) {
        params.append('industryTypes', criteria.industryTypes.join(','));
      }

      // Add industry category if specified
      if (criteria.industryCategory) {
        params.append('industryCategory', criteria.industryCategory);
      }

      toast({
        title: 'Searching...',
        description: 'Finding businesses across multiple industries using live data from Apify',
      });

      const response = await fetch(`/api/prospects/search?${params}`, {
        timeout: 90000, // 90 seconds timeout
      });
      
      // Handle 504 timeout errors
      if (response.status === 504) {
        throw new Error('Search timed out. The search is taking longer than expected. Please try with a smaller search radius or different location.');
      }
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', await response.text());
        throw new Error('Server returned invalid response. Please try again.');
      }
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error('Failed to parse server response. The search may have timed out. Please try again with a smaller search area.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchResults({
        businesses: data.data.businesses,
        searchCriteria: criteria,
        totalResults: data.data.totalResults,
        source: data.data.source, // Legacy field for compatibility
        dataSource: data.data.dataSource,
        message: data.data.message,
      });

      // Add to search history
      setSearchHistory(prev => {
        const newHistory = [criteria, ...prev.filter(h => 
          h.location !== criteria.location || 
          JSON.stringify(h.industryTypes) !== JSON.stringify(criteria.industryTypes) ||
          h.industryCategory !== criteria.industryCategory
        )].slice(0, 5);
        return newHistory;
      });

      const sourceText = data.data.dataSource === 'live' ? 'live data' : 'sample data';
      toast({
        title: 'Search completed',
        description: data.data.message || `Found ${data.data.totalResults} businesses using ${sourceText}`,
      });

    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: error.message || 'Failed to search for businesses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddProspect = async (business: Business) => {
    try {
      // Parse the business data to match API expectations
      const [city, stateZip] = business.address.split(', ');
      const [state, zipCode] = stateZip?.split(' ') || ['', ''];
      
      // Extract revenue estimate (convert from range to single number)
      const revenueMatch = business.estimatedRevenue.match(/\$(\d+)K/);
      const monthlyRevenue = revenueMatch ? parseInt(revenueMatch[1]) * 1000 : null;
      
      // Extract years in business
      const yearsMatch = business.yearsInBusiness.match(/(\d+\.?\d*)/);
      const yearsInBusiness = yearsMatch ? parseFloat(yearsMatch[1]) : null;
      
      // Extract employee count (take the lower number from range)
      const employeeMatch = business.employeeCount.match(/(\d+)/);
      const employeeCount = employeeMatch ? parseInt(employeeMatch[1]) : null;

      // Map business type to enum value - expanded for all industries
      const businessTypeMap: Record<string, string> = {
        // Healthcare
        'Medical Office': 'MEDICAL_OFFICE',
        'Dental Practice': 'DENTAL_PRACTICE',
        'Veterinary Clinic': 'VETERINARY_CLINIC',
        'Physical Therapy': 'PHYSICAL_THERAPY',
        'Mental Health': 'MENTAL_HEALTH',
        'Urgent Care': 'URGENT_CARE',
        'Medical Imaging': 'MEDICAL_IMAGING',
        'Laboratory': 'LABORATORY',
        'Pharmacy': 'PHARMACY',
        'Specialty Clinic': 'SPECIALTY_CLINIC',
        'Chiropractic': 'CHIROPRACTIC',
        'Optometry': 'OPTOMETRY',
        'Dermatology': 'DERMATOLOGY',
        // Restaurants & Food Service
        'Fast Food': 'FAST_FOOD',
        'Casual Dining': 'CASUAL_DINING',
        'Fine Dining': 'FINE_DINING',
        'Coffee Shop': 'COFFEE_SHOP',
        'Bakery': 'BAKERY',
        'Food Truck': 'FOOD_TRUCK',
        'Catering': 'CATERING',
        'Bar & Grill': 'BAR_GRILL',
        'Pizza Restaurant': 'PIZZA_RESTAURANT',
        'Ethnic Cuisine': 'ETHNIC_CUISINE',
        // Beauty & Wellness
        'Hair Salon': 'HAIR_SALON',
        'Nail Salon': 'NAIL_SALON',
        'Spa & Wellness': 'SPA_WELLNESS',
        'Massage Therapy': 'MASSAGE_THERAPY',
        'Tattoo Parlor': 'TATTOO_PARLOR',
        'Barbershop': 'BARBERSHOP',
        'Beauty Supply': 'BEAUTY_SUPPLY',
        'Cosmetic Services': 'COSMETIC_SERVICES',
        'Tanning Salon': 'TANNING_SALON',
        // Automotive Services
        'Auto Repair': 'AUTO_REPAIR',
        'Oil Change': 'OIL_CHANGE',
        'Tire Shop': 'TIRE_SHOP',
        'Car Wash': 'CAR_WASH',
        'Auto Detailing': 'AUTO_DETAILING',
        'Transmission Repair': 'TRANSMISSION_REPAIR',
        'Body Shop': 'BODY_SHOP',
        'Muffler Shop': 'MUFFLER_SHOP',
        'Brake Service': 'BRAKE_SERVICE',
        // Fitness & Recreation
        'Gym & Fitness': 'GYM_FITNESS',
        'Yoga Studio': 'YOGA_STUDIO',
        'Martial Arts': 'MARTIAL_ARTS',
        'Dance Studio': 'DANCE_STUDIO',
        'Personal Training': 'PERSONAL_TRAINING',
        'Sports Facility': 'SPORTS_FACILITY',
        'Recreation Center': 'RECREATION_CENTER',
        'Climbing Gym': 'CLIMBING_GYM',
        // Pet Services
        'Veterinary Services': 'VETERINARY_SERVICES',
        'Pet Grooming': 'PET_GROOMING',
        'Pet Boarding': 'PET_BOARDING',
        'Pet Training': 'PET_TRAINING',
        'Pet Daycare': 'PET_DAYCARE',
        'Pet Store': 'PET_STORE',
        'Dog Walking': 'DOG_WALKING',
        // Specialty Retail
        'Boutique Clothing': 'BOUTIQUE_CLOTHING',
        'Jewelry Store': 'JEWELRY_STORE',
        'Electronics Repair': 'ELECTRONICS_REPAIR',
        'Bike Shop': 'BIKE_SHOP',
        'Bookstore': 'BOOKSTORE',
        'Gift Shop': 'GIFT_SHOP',
        'Sporting Goods': 'SPORTING_GOODS',
        'Home Decor': 'HOME_DECOR',
        'Antique Shop': 'ANTIQUE_SHOP',
        // Business Services
        'Accounting Services': 'ACCOUNTING_SERVICES',
        'Legal Services': 'LEGAL_SERVICES',
        'Marketing Agency': 'MARKETING_AGENCY',
        'Consulting': 'CONSULTING',
        'Real Estate': 'REAL_ESTATE',
        'Insurance Agency': 'INSURANCE_AGENCY',
        'Financial Planning': 'FINANCIAL_PLANNING',
        'IT Services': 'IT_SERVICES',
        'Cleaning Services': 'CLEANING_SERVICES',
        'Landscaping': 'LANDSCAPING',
        'Other': 'OTHER',
      };

      // Map industry category to enum value
      const industryCategoryMap: Record<string, string> = {
        'HEALTHCARE': 'HEALTHCARE',
        'RESTAURANT_FOOD_SERVICE': 'RESTAURANT_FOOD_SERVICE',
        'BEAUTY_WELLNESS': 'BEAUTY_WELLNESS',
        'AUTOMOTIVE_SERVICES': 'AUTOMOTIVE_SERVICES',
        'FITNESS_RECREATION': 'FITNESS_RECREATION',
        'PET_SERVICES': 'PET_SERVICES',
        'SPECIALTY_RETAIL': 'SPECIALTY_RETAIL',
        'BUSINESS_SERVICES': 'BUSINESS_SERVICES',
      };

      const payload = {
        businessName: business.name,
        contactName: null, // Will be filled in later during qualification
        email: null,
        phone: business.phone,
        address: business.address,
        city: city?.trim(),
        state: state?.trim(),
        zipCode: zipCode?.trim(),
        businessType: businessTypeMap[business.businessType] || 'OTHER',
        industryCategory: industryCategoryMap[business.industryCategory] || 'BUSINESS_SERVICES',
        monthlyRevenue,
        yearsInBusiness,
        employeeCount,
        website: business.website,
        notes: `Added from research. Qualification score: ${business.qualificationScore}%`,
        tags: ['research', 'new-prospect'],
        source: 'Google Maps Research',
      };

      const response = await fetch('/api/prospects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add prospect');
      }

      return data.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add prospect');
    }
  };

  const handleSearchFromHistory = (criteria: SearchCriteria) => {
    handleSearch(criteria);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PipelinePro OS Research</h1>
          <p className="text-gray-600">
            Find and qualify businesses across 8+ industries for comprehensive prospect management
          </p>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Building2 className="h-4 w-4" />
            <span>8 Industry Categories</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4" />
            <span>Industry-Specific Criteria</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>Tailored Qualification</span>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <SearchForm onSearch={handleSearch} isLoading={isSearching} />

      {/* Search History */}
      {searchHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Searches</CardTitle>
            <CardDescription>Click to repeat a previous search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((criteria, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearchFromHistory(criteria)}
                  disabled={isSearching}
                  className="text-xs"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {criteria.location}
                  {criteria.industryCategory && (
                    <span className="ml-1">• {criteria.industryCategory.replace('_', ' ')}</span>
                  )}
                  <RefreshCw className="h-3 w-3 ml-1" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results or Empty State */}
      {searchResults ? (
        <SearchResults
          businesses={searchResults.businesses}
          searchCriteria={searchResults.searchCriteria}
          onAddProspect={handleAddProspect}
          dataSource={searchResults.dataSource}
          message={searchResults.message}
        />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start Multi-Industry Business Research
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              Enter a location above to search for real businesses across 8+ industries using Apify's web scraping technology.
              Find prospects with industry-specific qualification criteria.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-green-600">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Live Business Data</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Industry-Specific Qualification</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
